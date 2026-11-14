"""Atomically save exactly three requested review publisher files to isolated dual branches.

Execute only after the root confirms the actual existing-video inventory and review scope. This command pushes backup first, then primary (which triggers
the publisher workflow). It never touches main/master or force-updates any ref.
"""
import base64
import datetime
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile
import urllib.parse
import urllib.request
import uuid

from publish_review import HERE, validate_manifest

BRANCH = 'codex/books37-70-review-4k-v1'
REPOSITORIES = ('AlienCodes/literate-enigma', 'alienalgorithm/postgraduate-vocabulary')
PATHS = {
    '.github/books37-70-review-release/publish_review.py': 'publish_review.py',
    '.github/books37-70-review-release/MANIFEST.json': 'MANIFEST.json',
    '.github/workflows/publish-books37-70-review-4k.yml': 'publish-review.yml',
}


def utc():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def digest(data):
    return hashlib.sha256(data).hexdigest()


def git_blob_sha(data):
    return hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()


def api(repo, path, missing=False):
    result = subprocess.run(['gh', 'api', 'repos/' + repo + '/' + path], capture_output=True)
    if missing and result.returncode and b'HTTP 404' in result.stderr:
        return None
    if result.returncode:
        raise RuntimeError('GitHub read failed (exit ' + str(result.returncode) + ')')
    return json.loads(result.stdout)


def ref(repo):
    found = api(repo, 'git/ref/heads/' + BRANCH, missing=True)
    if found is None:
        return None
    assert found['ref'] == 'refs/heads/' + BRANCH
    assert found['object']['type'] == 'commit'
    assert re.fullmatch('[0-9a-f]{40}', found['object']['sha'])
    return found['object']['sha']


def verify_tree(repo, commit, data):
    actual_commit = api(repo, 'git/commits/' + commit)
    assert actual_commit['sha'] == commit and actual_commit['parents'] == [], 'Publisher must be an orphan commit.'
    tree = api(repo, 'git/trees/' + actual_commit['tree']['sha'] + '?recursive=1')
    assert tree['truncated'] is False
    blobs = [item for item in tree['tree'] if item['type'] == 'blob']
    assert set(item['path'] for item in blobs) == set(PATHS), 'Existing branch content differs; never replace it.'
    assert len(blobs) == 3
    assert all(item['type'] in ('tree', 'blob') for item in tree['tree'])
    for item in blobs:
        expected = data[item['path']]
        assert item['mode'] == '100644' and item['size'] == len(expected)
        assert item['sha'] == git_blob_sha(expected)
    return actual_commit['tree']['sha']


def verify_raw(repo, commit, data):
    verified = []
    for path in sorted(data):
        url = 'https://raw.githubusercontent.com/' + repo + '/' + commit + '/' + urllib.parse.quote(path, safe='/')
        with urllib.request.urlopen(url, timeout=90) as response:
            status = response.status
            remote_bytes = response.read()
        expected = data[path]
        assert status == 200 and remote_bytes == expected
        verified.append({'repo_path': path, 'http_status': status, 'bytes': len(remote_bytes), 'sha256': digest(remote_bytes), 'exact_local_bytes': True})
    return verified


def git(work, *args, env=None):
    result = subprocess.run(['git', '-C', str(work), *args], env=env, capture_output=True)
    if result.returncode:
        # Never echo credential-helper output or a potentially authenticated URL.
        raise RuntimeError('Git transport command failed (exit ' + str(result.returncode) + ')')
    return result.stdout.decode().strip()


def prepare_git(data, existing_commit, existing_repo):
    work = Path(tempfile.mkdtemp(prefix='books37-70-review-publisher-', dir='/dev/shm'))
    git(work, 'init', '--initial-branch=' + BRANCH)
    if existing_commit is not None:
        git(work, '-c', 'credential.helper=', '-c', 'credential.helper=!gh auth git-credential', 'fetch', '--depth=1', 'https://github.com/' + existing_repo + '.git', existing_commit)
        assert git(work, 'rev-parse', 'FETCH_HEAD') == existing_commit
        commit = existing_commit
    else:
        for remote_path, content in data.items():
            destination = work / remote_path
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(content)
        git(work, 'add', '--', *sorted(data))
        env = os.environ.copy()
        # Commit identity is tooling attribution; no user's identity is invented.
        env.update({'GIT_AUTHOR_NAME': 'Codex', 'GIT_AUTHOR_EMAIL': 'codex@openai.com', 'GIT_COMMITTER_NAME': 'Codex', 'GIT_COMMITTER_EMAIL': 'codex@openai.com'})
        git(work, '-c', 'commit.gpgsign=false', 'commit', '--no-verify', '-m', 'Publish requested books37-70 existing-video individual review bundle', env=env)
        commit = git(work, 'rev-parse', 'HEAD')
        assert git(work, 'rev-list', '--parents', '-n', '1', commit) == commit
    entries = git(work, 'ls-tree', '-r', commit).splitlines()
    assert len(entries) == 3
    for entry in entries:
        prefix, path = entry.split('\t', 1)
        mode, kind, blob = prefix.split()
        assert path in data and mode == '100644' and kind == 'blob'
        assert blob == git_blob_sha(data[path])
        assert git(work, 'cat-file', '-s', blob) == str(len(data[path]))
    return work, commit


def main():
    # These checks precede any remote read or mutation, and reject a placeholder.
    manifest_path = HERE / 'MANIFEST.json'
    assert manifest_path.is_file(), 'No actual existing-video review manifest exists yet.'
    config = json.loads(manifest_path.read_text())
    validate_manifest(config)
    profile = json.loads((HERE / 'PUBLICATION-PROFILE.json').read_text())
    assert profile['branch'] == BRANCH and profile['requested_book_range'] == ['37', '70']
    for name in ('publish_review.py', 'publish-review.yml'):
        expected = profile['files'][name]
        content = (HERE / name).read_bytes()
        assert len(content) == expected['bytes'] and digest(content) == expected['sha256']
    data = {remote: (HERE / local).read_bytes() for remote, local in PATHS.items()}
    assert all(len(content) < 100_000 for content in data.values())
    attempt_path = HERE / ('TRANSPORT-ATTEMPT-' + uuid.uuid4().hex + '.json')
    progress = {'requested_book_range': ['37', '70'], 'branch': BRANCH, 'started_utc': utc(), 'manifest_sha256': digest(data['.github/books37-70-review-release/MANIFEST.json']), 'archives': [], 'remote_native_success_claimed': False}
    try:
        observed = {repo: ref(repo) for repo in REPOSITORIES}
        nonempty = {commit for commit in observed.values() if commit is not None}
        assert len(nonempty) <= 1, 'Existing branch commits differ; no branch will be overwritten.'
        for repo, commit in observed.items():
            if commit is not None:
                verify_tree(repo, commit, data)
        chosen = next(iter(nonempty), None)
        owner = next((repo for repo in REPOSITORIES if observed[repo] is not None), None)
        if len(nonempty) == 1 and all(observed.values()):
            work = None
            commit = chosen
        else:
            work, commit = prepare_git(data, chosen, owner)
        progress['actual_publisher_commit'] = commit
        progress['only_three_publisher_files'] = sorted(PATHS)
        for repo in REPOSITORIES:
            # Repeat just before this mutation to make concurrent changes fail closed.
            current = ref(repo)
            pushed = False
            if current is not None:
                assert current == commit, 'Branch changed concurrently; no force update permitted.'
                verify_tree(repo, commit, data)
            else:
                assert work is not None
                git(work, '-c', 'credential.helper=', '-c', 'credential.helper=!gh auth git-credential', 'push', 'https://github.com/' + repo + '.git', commit + ':refs/heads/' + BRANCH)
                pushed = True
            assert ref(repo) == commit
            tree_sha = verify_tree(repo, commit, data)
            row = {'repo': repo, 'branch': BRANCH, 'actual_remote_commit': commit, 'head_verified': True, 'orphan_commit_verified': True, 'tree_sha': tree_sha, 'atomic_three_file_commit': True, 'push_performed_this_attempt': pushed, 'triggers_primary_native_publisher': pushed and repo == REPOSITORIES[1], 'native_publisher_runs_only_on_primary': True, 'immutable_raw_files': verify_raw(repo, commit, data)}
            progress['archives'].append(row)
            attempt_path.write_text(json.dumps(progress, ensure_ascii=False, indent=2) + '\n')
        assert len(progress['archives']) == 2
        assert {row['actual_remote_commit'] for row in progress['archives']} == {commit}
        progress.update({'passed_dual_publisher_source_save': True, 'primary_trigger_head': commit, 'completed_utc': utc(), 'other_refs_changed': False, 'only_three_publisher_files': sorted(PATHS), 'actual_existing_video_count': 34, 'inherited_full_V3_passed_count': 24, 'historical_full_QA_pending_count': 10, 'all34_final_or_QA_passed_claimed': False, 'native_publication_success_claimed': False})
        attempt_path.write_text(json.dumps(progress, ensure_ascii=False, indent=2) + '\n')
        receipt = HERE / 'ACTUAL-TRIGGER-DUAL-SAVE.json'
        if receipt.exists():
            previous = json.loads(receipt.read_text())
            assert previous['actual_publisher_commit'] == commit and previous['manifest_sha256'] == progress['manifest_sha256'], 'Prior immutable trigger receipt differs.'
            destination = HERE / ('ACTUAL-TRIGGER-DUAL-SAVE.recheck-' + uuid.uuid4().hex + '.json')
        else:
            destination = receipt
        destination.write_text(json.dumps(progress, ensure_ascii=False, indent=2) + '\n')
        print(json.dumps({'requested_book_range': ['37', '70'], 'primary_trigger_head': commit, 'branch': BRANCH, 'dual_source_save_passed': True, 'receipt': str(destination), 'native_publication_success_claimed': False}, ensure_ascii=False), flush=True)
    except BaseException as error:
        progress.update({'completed_utc': utc(), 'transport_failed': True, 'failure_type': type(error).__name__, 'native_publication_success_claimed': False})
        attempt_path.write_text(json.dumps(progress, ensure_ascii=False, indent=2) + '\n')
        raise


if __name__ == '__main__':
    main()
