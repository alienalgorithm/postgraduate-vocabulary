"""Publish unchanged existing book37–70 MP4s as an explicitly requested review ZIP."""
import datetime
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import urllib.parse
import urllib.request
import zipfile

HERE = Path(__file__).resolve().parent
REPO = 'alienalgorithm/postgraduate-vocabulary'
TAG = 'books37-70-review-4k-v1'
ZIP_NAME = '37-70-4K-REVIEW.zip'
SOURCES = ('65','19','29','43','52','48','37','31','16','40','54','46','24','70','38','09','68','35','30','69','66','08','63','32','57','23','64','18','56','41','58','25','59','45')
PENDING_QA_BOOKS = {'37','42','45','47','50','53','55','56','57','64'}


def sha(path):
    with Path(path).open('rb') as source:
        return hashlib.file_digest(source, 'sha256').hexdigest()


def api(path, method='GET', data=None, missing=False):
    command = ['gh', 'api', 'repos/' + REPO + '/' + path]
    if method != 'GET':
        command += ['-X', method]
    if data is not None:
        command += ['--input', '-']
    result = subprocess.run(command, input=None if data is None else json.dumps(data).encode(), capture_output=True)
    if missing and result.returncode and b'HTTP 404' in result.stderr:
        return None
    if result.returncode:
        raise RuntimeError('GitHub publication operation failed (exit ' + str(result.returncode) + ')')
    return json.loads(result.stdout)


def validate_manifest(manifest):
    assert manifest['kind'] == 'explicitly_requested_existing_video_individual_review_release'
    assert manifest['user_scope_record'] == '078'
    assert manifest['requested_book_range'] == ['37', '70']
    assert manifest['requested_video_count'] == manifest['actual_available_video_count'] == 34
    assert manifest['requested_video_range_complete'] is True
    assert manifest['all34_final_or_full_QA_passed_claimed'] is False
    assert manifest['current_round_individual_user_final_acceptance_count'] == 0
    assert manifest['inherited_complete_full_V3_passed_count'] == 24
    assert manifest['historical_video_pending_current_full_QA_count'] == 10
    assert manifest['new_rendering_or_audio_editing_performed'] is False
    assert manifest['current_final_aliases_changed'] is False
    assert manifest['uniform_0_6_second_tail_claimed_for_this_review_release'] is False
    assert manifest['release_tag'] == TAG and manifest['zip_name'] == ZIP_NAME
    assert manifest['release_prerelease'] is True
    videos = manifest['videos']
    assert len(videos) == 34
    assert [r['book_order'] for r in videos] == [f'{i:02d}' for i in range(37, 71)]
    assert tuple(r['source_id'] for r in videos) == SOURCES
    assert len({r['release_name'] for r in videos}) == 34
    assert manifest['total_video_bytes'] == sum(r['bytes'] for r in videos)
    assert manifest['total_video_bytes'] == 517092361
    for row in videos:
        assert row['current_round_user_individual_final_acceptance'] is False
        assert row['media_is_newly_rendered_by_this_release'] is False
        assert Path(row['release_name']).name == row['release_name'] and row['release_name'].endswith('.mp4')
        assert row['release_name'].startswith(row['book_order'] + ' ')
        assert re.fullmatch('[0-9a-f]{40}', row['video_commit'])
        assert re.fullmatch('[0-9a-f]{64}', row['sha256'])
        assert row['bytes'] > 0 and row['video_repo_path'].endswith('.mp4')
        assert not row['video_repo_path'].startswith('/') and '..' not in Path(row['video_repo_path']).parts
        if row['book_order'] in PENDING_QA_BOOKS:
            assert row['inherited_full_V3_passed'] is False
            assert row['review_status'] == 'pending_full_QA_and_user_individual_review_not_a_final'
            assert row['existing_media_kind'] == 'historical_published_video_pending_current_full_QA'
        else:
            assert row['inherited_full_V3_passed'] is True
            assert row['review_status'] == 'pending_user_individual_review'
            assert row['existing_media_kind'] == 'current_permanently_archived_actual_full_V3_passed_video'
        observations = row['actual_observations']
        primary = [a for a in observations if a['repository'] == REPO and a['passed_byte_identity'] is True]
        assert len(primary) == 1
        assert primary[0]['http_status'] == 200 and primary[0]['bytes'] == row['bytes'] and primary[0]['sha256'] == row['sha256']
        assert primary[0]['commit'] == row['video_commit'] and primary[0]['repo_path'] == row['video_repo_path']


def main():
    if os.environ.get('GITHUB_REPOSITORY') != REPO:
        print('Backup retains publisher sources; primary repository alone publishes the review Release.')
        return
    manifest_path = HERE / 'MANIFEST.json'
    manifest = json.loads(manifest_path.read_text())
    validate_manifest(manifest)
    assert manifest['publisher_program_sha256'] == sha(__file__)
    out = Path(os.environ['GITHUB_WORKSPACE']) / 'review-release-output'
    out.mkdir(exist_ok=True)
    media_dir = out / 'unchanged-input-videos'
    media_dir.mkdir(exist_ok=True)
    local_videos = []
    for row in manifest['videos']:
        path = media_dir / row['release_name']
        url = 'https://raw.githubusercontent.com/' + REPO + '/' + row['video_commit'] + '/' + urllib.parse.quote(row['video_repo_path'], safe='/')
        with urllib.request.urlopen(url, timeout=180) as response, path.open('wb') as target:
            assert response.status == 200
            while chunk := response.read(1024 * 1024):
                target.write(chunk)
        assert path.stat().st_size == row['bytes'] and sha(path) == row['sha256']
        local_videos.append((row, path))
    zipped = out / ZIP_NAME
    with zipfile.ZipFile(zipped, 'w', compression=zipfile.ZIP_STORED, allowZip64=True) as bundle:
        for row, path in local_videos:
            entry = zipfile.ZipInfo(row['release_name'], date_time=(2026, 11, 14, 0, 0, 0))
            entry.compress_type = zipfile.ZIP_STORED
            entry.external_attr = 0o100644 << 16
            bundle.writestr(entry, path.read_bytes())
        entry = zipfile.ZipInfo('MANIFEST.json', date_time=(2026, 11, 14, 0, 0, 0))
        entry.compress_type = zipfile.ZIP_STORED
        entry.external_attr = 0o100644 << 16
        bundle.writestr(entry, manifest_path.read_bytes())
    with zipfile.ZipFile(zipped) as bundle:
        assert bundle.testzip() is None
        assert set(bundle.namelist()) == {row['release_name'] for row in manifest['videos']} | {'MANIFEST.json'}
        assert len(bundle.infolist()) == 35
        assert bundle.read('MANIFEST.json') == manifest_path.read_bytes()
        for row in manifest['videos']:
            assert bundle.getinfo(row['release_name']).file_size == row['bytes']
            with bundle.open(row['release_name']) as entry:
                assert hashlib.file_digest(entry, 'sha256').hexdigest() == row['sha256']
    zip_bytes = zipped.stat().st_size
    zip_sha = sha(zipped)
    head = os.environ['GITHUB_SHA']
    assert re.fullmatch('[0-9a-f]{40}', head)
    previous_tag = api('git/ref/tags/' + TAG, missing=True)
    if previous_tag is not None:
        assert previous_tag['object']['type'] == 'commit' and previous_tag['object']['sha'] == head
    marker = 'Books37-70 individual review ZIP SHA-256: ' + zip_sha
    release = api('releases/tags/' + TAG, missing=True)
    if release is None:
        candidates = [r for r in api('releases?per_page=100') if r['tag_name'] == TAG and marker in (r.get('body') or '')]
        assert len(candidates) <= 1
        release = candidates[0] if candidates else None
    if release is None:
        release = api('releases', 'POST', {'tag_name': TAG, 'target_commitish': head, 'name': manifest['release_title'], 'body': manifest['release_body'] + '\n\n<!-- ' + marker + ' -->', 'draft': True, 'prerelease': True})
    assert release['tag_name'] == TAG and marker in (release.get('body') or '')
    assert release['target_commitish'] == head
    assets = api('releases/' + str(release['id']) + '/assets?per_page=100')
    assert len(assets) <= 1 and all(a['name'] == ZIP_NAME for a in assets)
    if not assets:
        subprocess.run(['gh', 'release', 'upload', TAG, str(zipped), '--repo', REPO], check=True)
    assets = api('releases/' + str(release['id']) + '/assets?per_page=100')
    assert len(assets) == 1
    asset = assets[0]
    assert asset['state'] == 'uploaded' and asset['name'] == ZIP_NAME
    assert asset['size'] == zip_bytes and asset['digest'] == 'sha256:' + zip_sha
    if release['draft']:
        api('releases/' + str(release['id']), 'PATCH', {'draft': False, 'prerelease': True, 'make_latest': 'false'})
    release = api('releases/' + str(release['id']))
    assert release['draft'] is False and release['prerelease'] is True
    actual_tag = api('git/ref/tags/' + TAG)['object']
    assert actual_tag['type'] == 'commit' and actual_tag['sha'] == head
    asset = api('releases/' + str(release['id']) + '/assets?per_page=100')[0]
    public_sha = hashlib.sha256()
    public_bytes = 0
    with urllib.request.urlopen(asset['browser_download_url'], timeout=180) as response:
        assert response.status == 200
        while chunk := response.read(1024 * 1024):
            public_sha.update(chunk)
            public_bytes += len(chunk)
    assert public_bytes == zip_bytes and public_sha.hexdigest() == zip_sha
    receipt = {'passed': True, 'kind': 'existing_videos_individual_review_release', 'requested_book_range': ['37','70'], 'video_count': 34, 'ZIP_entry_count': 35, 'ZIP_CRC_errors': 0, 'all34_original_MP4_bytes_and_sha256_verified': True, 'total_original_MP4_bytes': manifest['total_video_bytes'], 'inherited_full_V3_passed_count': 24, 'historical_full_QA_pending_count': 10, 'all34_final_or_complete_QA_passed_claimed': False, 'release_prerelease': True, 'media_reencoded_or_audio_changed': False, 'existing_final_aliases_changed': False, 'release_id': release['id'], 'release_url': release['html_url'], 'zip_url': asset['browser_download_url'], 'zip_bytes': public_bytes, 'zip_sha256': public_sha.hexdigest(), 'actual_public_entire_ZIP_download_verified': True, 'manifest_sha256': sha(manifest_path), 'publisher_sha256': sha(__file__), 'native_actions_run_id': int(os.environ['GITHUB_RUN_ID']), 'native_actions_head_sha': head, 'other_releases_or_tags_deleted': False, 'recorded_utc': datetime.datetime.now(datetime.timezone.utc).isoformat()}
    (out / 'RELEASE-VERIFICATION.json').write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(receipt, ensure_ascii=False), flush=True)


if __name__ == '__main__':
    main()
