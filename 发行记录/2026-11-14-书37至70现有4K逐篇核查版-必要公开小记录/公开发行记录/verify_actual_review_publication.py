"""Independently bind the actual native receipt/code and download the public ZIP once.

Usage: python verify_actual_review_publication.py --run ID --head SHA
       --artifact-id ID --artifact-zip PATH --public-zip /dev/shm/37-70-4K-REVIEW.zip
Only GitHub read operations are used. The public ZIP is fully downloaded once,
then its CRC, exact manifest, and all 34 unchanged MP4 hashes are verified.
"""
import argparse
import datetime
import hashlib
import json
from pathlib import Path
import re
import subprocess
import urllib.parse
import urllib.request
import zipfile

from publish_review import HERE, REPO, TAG, ZIP_NAME, validate_manifest

CODE_PATH = '.github/books37-70-review-release/publish_review.py'
MANIFEST_PATH = '.github/books37-70-review-release/MANIFEST.json'
WORKFLOW_PATH = '.github/workflows/publish-books37-70-review-4k.yml'


def sha(path):
    with Path(path).open('rb') as source:
        return hashlib.file_digest(source, 'sha256').hexdigest()


def api(path):
    result = subprocess.run(['gh', 'api', 'repos/' + REPO + '/' + path], capture_output=True, check=True)
    return json.loads(result.stdout)


def immutable_bytes(head, path):
    url = 'https://raw.githubusercontent.com/' + REPO + '/' + head + '/' + urllib.parse.quote(path, safe='/')
    with urllib.request.urlopen(url, timeout=90) as response:
        assert response.status == 200
        return response.read()


def save(name, record):
    target = HERE / name
    encoded = (json.dumps(record, ensure_ascii=False, indent=2) + '\n').encode()
    if target.exists():
        assert target.read_bytes() == encoded, 'Preserve immutable observation: ' + name
    else:
        target.write_bytes(encoded)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--run', type=int, required=True)
    parser.add_argument('--head', required=True)
    parser.add_argument('--artifact-id', type=int, required=True)
    parser.add_argument('--artifact-zip', type=Path, required=True)
    parser.add_argument('--public-zip', type=Path, required=True)
    args = parser.parse_args()
    assert re.fullmatch('[0-9a-f]{40}', args.head)
    manifest_bytes = (HERE / 'MANIFEST.json').read_bytes()
    manifest = json.loads(manifest_bytes)
    validate_manifest(manifest)
    run = api('actions/runs/' + str(args.run))
    assert run['status'] == 'completed' and run['conclusion'] == 'success'
    assert run['head_sha'] == args.head and run['head_branch'] == 'codex/books37-70-review-4k-v1'
    assert run['repository']['full_name'] == REPO
    assert run['path'] == WORKFLOW_PATH
    artifact = api('actions/artifacts/' + str(args.artifact_id))
    assert artifact['expired'] is False
    assert artifact['name'] == 'books37-70-review-release-verification-' + str(args.run)
    assert artifact['workflow_run']['id'] == args.run and artifact['workflow_run']['head_sha'] == args.head
    assert args.artifact_zip.stat().st_size == artifact['size_in_bytes']
    artifact_sha = sha(args.artifact_zip)
    assert artifact['digest'] == 'sha256:' + artifact_sha
    with zipfile.ZipFile(args.artifact_zip) as bundle:
        assert bundle.testzip() is None
        assert bundle.namelist() == ['RELEASE-VERIFICATION.json']
        receipt_bytes = bundle.read('RELEASE-VERIFICATION.json')
    receipt = json.loads(receipt_bytes)
    assert receipt['passed'] is True
    assert receipt['kind'] == 'existing_videos_individual_review_release'
    assert receipt['native_actions_run_id'] == args.run and receipt['native_actions_head_sha'] == args.head
    assert receipt['requested_book_range'] == ['37', '70']
    assert receipt['video_count'] == 34 and receipt['ZIP_entry_count'] == 35
    assert receipt['ZIP_CRC_errors'] == 0 and receipt['all34_original_MP4_bytes_and_sha256_verified'] is True
    assert receipt['total_original_MP4_bytes'] == 517092361
    assert receipt['inherited_full_V3_passed_count'] == 24 and receipt['historical_full_QA_pending_count'] == 10
    assert receipt['all34_final_or_complete_QA_passed_claimed'] is False
    assert receipt['release_prerelease'] is True
    assert receipt['media_reencoded_or_audio_changed'] is False and receipt['existing_final_aliases_changed'] is False
    assert receipt['actual_public_entire_ZIP_download_verified'] is True
    assert receipt['other_releases_or_tags_deleted'] is False
    assert receipt['manifest_sha256'] == hashlib.sha256(manifest_bytes).hexdigest()
    actual_code = immutable_bytes(args.head, CODE_PATH)
    actual_manifest = immutable_bytes(args.head, MANIFEST_PATH)
    actual_workflow = immutable_bytes(args.head, WORKFLOW_PATH)
    assert actual_code == (HERE / 'publish_review.py').read_bytes()
    assert actual_manifest == manifest_bytes
    assert actual_workflow == (HERE / 'publish-review.yml').read_bytes()
    assert receipt['publisher_sha256'] == hashlib.sha256(actual_code).hexdigest() == manifest['publisher_program_sha256']
    release = api('releases/' + str(receipt['release_id']))
    assert release['tag_name'] == TAG and release['draft'] is False and release['prerelease'] is True
    assert release['target_commitish'] == args.head and release['html_url'] == receipt['release_url']
    tag = api('git/ref/tags/' + TAG)['object']
    assert tag['type'] == 'commit' and tag['sha'] == args.head
    assets = api('releases/' + str(release['id']) + '/assets?per_page=100')
    assert len(assets) == 1
    asset = assets[0]
    assert asset['state'] == 'uploaded' and asset['name'] == ZIP_NAME
    assert asset['size'] == receipt['zip_bytes']
    assert asset['digest'] == 'sha256:' + receipt['zip_sha256']
    assert asset['browser_download_url'] == receipt['zip_url']
    assert asset['browser_download_url'] == 'https://github.com/' + REPO + '/releases/download/' + TAG + '/' + ZIP_NAME
    assert not args.public_zip.exists(), 'Public ZIP already exists; do not silently download it twice.'
    partial = args.public_zip.with_name(args.public_zip.name + '.part')
    assert not partial.exists(), 'Preserve/inspect a prior incomplete download before retrying.'
    read_bytes = 0
    read_sha = hashlib.sha256()
    with urllib.request.urlopen(asset['browser_download_url'], timeout=180) as response, partial.open('wb') as target:
        assert response.status == 200
        while chunk := response.read(1024 * 1024):
            target.write(chunk)
            read_bytes += len(chunk)
            read_sha.update(chunk)
    assert read_bytes == receipt['zip_bytes'] and read_sha.hexdigest() == receipt['zip_sha256']
    partial.rename(args.public_zip)
    verified_videos = []
    with zipfile.ZipFile(args.public_zip) as bundle:
        assert bundle.testzip() is None
        assert len(bundle.infolist()) == 35
        assert set(bundle.namelist()) == {r['release_name'] for r in manifest['videos']} | {'MANIFEST.json'}
        assert bundle.read('MANIFEST.json') == manifest_bytes
        for row in manifest['videos']:
            assert bundle.getinfo(row['release_name']).file_size == row['bytes']
            with bundle.open(row['release_name']) as video:
                actual_sha = hashlib.file_digest(video, 'sha256').hexdigest()
            assert actual_sha == row['sha256']
            verified_videos.append({'book_order': row['book_order'], 'source_id': row['source_id'], 'name': row['release_name'], 'bytes': row['bytes'], 'sha256': actual_sha, 'review_status': row['review_status'], 'inherited_full_V3_passed': row['inherited_full_V3_passed']})
    timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
    identity = {'passed': True, 'repo': REPO, 'actual_native_run': args.run, 'actual_native_head': args.head, 'actual_artifact_id': args.artifact_id, 'actual_artifact_zip_bytes': args.artifact_zip.stat().st_size, 'actual_artifact_zip_sha256': artifact_sha, 'actual_artifact_CRC_errors': 0, 'actual_publisher_sha256': hashlib.sha256(actual_code).hexdigest(), 'actual_manifest_sha256': hashlib.sha256(actual_manifest).hexdigest(), 'actual_workflow_sha256': hashlib.sha256(actual_workflow).hexdigest(), 'actual_executed_head_files_equal_frozen_local_files': True, 'native_receipt_passed': True, 'recorded_utc': timestamp}
    observation = {'passed': True, 'requested_book_range': ['37', '70'], 'release_id': release['id'], 'release_url': release['html_url'], 'direct_download_url': asset['browser_download_url'], 'prerelease': True, 'actual_entire_public_ZIP_HTTP_status': 200, 'actual_entire_public_ZIP_bytes': read_bytes, 'actual_entire_public_ZIP_sha256': read_sha.hexdigest(), 'ZIP_entry_count': 35, 'ZIP_CRC_errors': 0, 'all34_MP4_sizes_and_sha256_exact': True, 'video_count': 34, 'total_original_MP4_bytes': 517092361, 'inherited_full_V3_passed_count': 24, 'historical_full_QA_pending_count': 10, 'all34_final_or_full_QA_passed_claimed': False, 'media_changed': False, 'native_identity': identity, 'videos': verified_videos, 'recorded_utc': timestamp}
    save('ACTUAL-NATIVE-PUBLICATION-IDENTITY.json', identity)
    save('PUBLIC-RELEASE-OBSERVATION.json', observation)
    save('RUN.json', run)
    local_receipt = HERE / 'RELEASE-VERIFICATION.json'
    if local_receipt.exists():
        assert local_receipt.read_bytes() == receipt_bytes
    else:
        local_receipt.write_bytes(receipt_bytes)
    print(json.dumps({k:v for k,v in observation.items() if k not in ('videos','native_identity')}, ensure_ascii=False), flush=True)


if __name__ == '__main__':
    main()
