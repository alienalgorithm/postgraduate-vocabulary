"""Inventory only existing MP4s in book37–70, without modifying media or PDFs."""
import concurrent.futures
import datetime
import hashlib
import json
from pathlib import Path
import subprocess
import urllib.error
import urllib.parse
import urllib.request

HERE = Path(__file__).resolve().parent
WORK = Path('/workspace/work')
ORDER_FILE = WORK / 'video-audit70-20261113/publication-order-manifest-readonly.json'
CURRENT_FILE = WORK / 'video-archive-batches-20261114/operations-user057-books31/final-remote-cumulative-inventory.json'
ORIGINAL_COMMIT = '64621068034f8b6e09836a6d97210a0e9b2f1ed6'
PRIMARY = 'alienalgorithm/postgraduate-vocabulary'
BACKUP = 'AlienCodes/literate-enigma'


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def one_download(row, repo):
    url = 'https://raw.githubusercontent.com/' + repo + '/' + row['video_commit'] + '/' + urllib.parse.quote(row['video_repo_path'], safe='/')
    size = 0
    hashed = hashlib.sha256()
    try:
        with urllib.request.urlopen(url, timeout=120) as response:
            status = response.status
            while chunk := response.read(1024 * 1024):
                hashed.update(chunk)
                size += len(chunk)
    except urllib.error.HTTPError as error:
        return {'repository': repo, 'book_order': row['book_order'], 'source_id': row['source_id'], 'commit': row['video_commit'], 'repo_path': row['video_repo_path'], 'http_status': error.code, 'full_video_obtained': False, 'passed_byte_identity': False}
    result = {'repository': repo, 'book_order': row['book_order'], 'source_id': row['source_id'], 'commit': row['video_commit'], 'repo_path': row['video_repo_path'], 'http_status': status, 'bytes': size, 'sha256': hashed.hexdigest(), 'full_video_obtained': True, 'passed_byte_identity': status == 200 and size == row['bytes'] and hashed.hexdigest() == row['sha256']}
    assert result['passed_byte_identity'], 'Existing video size/SHA mismatch: book' + row['book_order'] + ' ' + repo
    return result


def main():
    order = json.loads(ORDER_FILE.read_text())
    current = json.loads(CURRENT_FILE.read_text())
    passed = {a['source_id']: a for a in current['articles']}
    entries = []
    for a in order['articles']:
        if not 37 <= int(a['new_id']) <= 70:
            continue
        source = a['source_id']
        known = passed.get(source)
        if known:
            assert known['new_id'] == a['new_id'] and known['passed_per_article'] is True
            native_run = known.get('source_run')
            if native_run is None and source == '64':
                old_h = json.loads((WORK / 'video-revision-delivery/actual53-64-validation/archive-handoff.json').read_text())
                actual_a = [x for x in old_h['articles'] if x['source_id'] == source and x['new_id'] == a['new_id']]
                assert len(actual_a) == 1 and actual_a[0]['passed_per_article'] is True and actual_a[0]['final_mp4']['sha256'] == known['sha256']
                native_run = old_h['source_run']
            assert isinstance(native_run, int)
            row = {'book_order': a['new_id'], 'source_id': source, 'title_zh': a['title_zh'], 'title_en': a['title_en'], 'video_commit': known['asset_commit'], 'video_repo_path': known['video_repo_path'], 'bytes': known['bytes'], 'sha256': known['sha256'], 'existing_media_kind': 'current_permanently_archived_actual_full_V3_passed_video', 'inherited_full_V3_passed': True, 'inherited_native_run': native_run, 'current_round_user_individual_final_acceptance': False, 'review_status': 'pending_user_individual_review', 'media_is_newly_rendered_by_this_release': False}
        else:
            row = {'book_order': a['new_id'], 'source_id': source, 'title_zh': a['title_zh'], 'title_en': a['title_en'], 'video_commit': ORIGINAL_COMMIT, 'video_repo_path': '顺序重排版/' + a['video'], 'bytes': a['video_bytes'], 'sha256': a['video_sha256'], 'existing_media_kind': 'historical_published_video_pending_current_full_QA', 'inherited_full_V3_passed': False, 'inherited_native_run': None, 'current_round_user_individual_final_acceptance': False, 'review_status': 'pending_full_QA_and_user_individual_review_not_a_final', 'media_is_newly_rendered_by_this_release': False}
        row['release_name'] = row['book_order'] + ' ' + row['title_zh'] + '.mp4'
        entries.append(row)
    assert len(entries) == 34 and [r['book_order'] for r in entries] == [f'{i:02d}' for i in range(37, 71)]
    assert sum(r['inherited_full_V3_passed'] for r in entries) == 24
    tasks = [(row, repo) for row in entries for repo in (PRIMARY, BACKUP)]
    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        future_rows = {pool.submit(one_download, row, repo): (row, repo) for row, repo in tasks}
        for future in concurrent.futures.as_completed(future_rows):
            result = future.result()
            results.append(result)
            print(json.dumps({'book_order': result['book_order'], 'source_id': result['source_id'], 'repository': result['repository'], 'status': result['http_status'], 'byte_identity': result['passed_byte_identity']}, ensure_ascii=False), flush=True)
    for row in entries:
        row['actual_observations'] = sorted([r for r in results if r['book_order'] == row['book_order']], key=lambda x: x['repository'])
        assert any(r['repository'] == PRIMARY and r['passed_byte_identity'] for r in row['actual_observations'])
    inventory = {'kind': 'requested_books37_to70_existing_video_review_inventory', 'scope_user_record': '078', 'book_range': ['37', '70'], 'requested_count': 34, 'actual_available_primary_count': len(entries), 'current_actual_full_V3_passed_count': 24, 'historical_full_QA_pending_count': 10, 'all34_final_or_current_full_QA_passed_claimed': False, 'individual_user_review_pending_count': 34, 'source_order_metadata_sha256': sha(ORDER_FILE), 'current_permanent_archive_inventory_sha256': sha(CURRENT_FILE), 'existing_videos_only_no_reencoding_audio_or_tail_change': True, 'PDF_files_read_or_changed': False, 'remote_mutations_performed': False, 'recorded_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'total_video_bytes': sum(r['bytes'] for r in entries), 'videos': entries}
    output = HERE / 'ACTUAL-EXISTING-VIDEO-INVENTORY.json'
    assert not output.exists(), 'Preserve prior immutable observations; do not overwrite inventory.'
    output.write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'inventory': str(output), 'bytes': output.stat().st_size, 'sha256': sha(output), 'actual_videos': len(entries), 'total_video_bytes': inventory['total_video_bytes']}, ensure_ascii=False), flush=True)


if __name__ == '__main__':
    main()
