"""Build only from the archiver's complete, verified actual first34 results."""
from pathlib import Path
import hashlib
import json
import sys

HERE = Path(__file__).resolve().parent
profile = json.loads((HERE / 'PUBLICATION-PROFILE.json').read_text())
inputs_path = Path(sys.argv[1])
inputs = json.loads(inputs_path.read_text())
assert inputs['all34_complete'] is True
assert inputs['actual_ready_video_count'] == inputs['expected_video_count'] == 34
assert inputs['partial'] is False
assert inputs['final_alias_exact_proof']['all_current_final_file_modes_sizes_Git_SHA_verified'] is True
assert inputs['final_alias_exact_proof']['same_final_folder_tree_in_both_repositories']
assert inputs['book35_plus_media_audio_body_not_changed'] is True
assert inputs['PDF_work_remains_paused'] is True
rows = [dict(row, book_order=str(row['new_id']).zfill(2)) for row in inputs['videos']]
assert all(row['current_final_alias_exact_identity_proven'] is True for row in rows)
assert len(rows) == 34
expected = profile['expected_source_to_book']
assert {str(r['source_id']).zfill(2): str(r['book_order']).zfill(2) for r in rows} == expected
videos = []
for row in sorted(rows, key=lambda x: int(x['book_order'])):
    assert row['actual_complete_validation_passed'] is True
    assert row['actual_dual_permanent_archive_passed'] is True
    assert row['preview_only'] is False
    assert row['post_reading_pause_seconds'] == 0.6
    assert 0.6 <= row['actual_end_reading_pause_seconds'] < 0.633334
    assert row['bytes'] > 0 and len(row['sha256']) == 64
    assert len(row['validation_handoff_sha256']) == 64
    assert len(row['asset_commit']) == 40
    name = row['book_order'] + ' ' + row['title_zh'] + '.mp4'
    assert Path(name).name == name
    videos.append({'source_id': row['source_id'], 'book_order': row['book_order'],
                   'title_zh': row['title_zh'], 'release_name': name,
                   'archived_commit': row['asset_commit'], 'repo_path': row['video_repo_path'],
                   'bytes': row['bytes'], 'sha256': row['sha256'],
                   'actual_complete_validation_passed': True,
                   'actual_dual_permanent_archive_passed': True, 'preview_only': False,
                   'end_reading_pause_seconds': 0.6,
                   'actual_end_reading_pause_seconds': row['actual_end_reading_pause_seconds'],
                   'validation_handoff_sha256': row['validation_handoff_sha256']})
manifest = {'tag': profile['tag'], 'actual_all_34_full_validation_and_dual_archive_passed': True,
            'end_reading_pause_seconds': 0.6,
            'final_directory_commit': inputs['current_main_commit'], 'video_count': 34,
            'first34_actual_archive_inputs_sha256': hashlib.sha256(inputs_path.read_bytes()).hexdigest(),
            'videos': videos, 'MP4_bytes_preserved': True, 'old_versions_preserved': True}
output = HERE / 'MANIFEST.json'
assert not output.exists(), 'Never silently overwrite a frozen publication manifest.'
output.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'manifest_sha256': hashlib.sha256(output.read_bytes()).hexdigest(),
                  'actual_video_count': len(videos), 'actual_MP4_bytes': sum(x['bytes'] for x in videos),
                  'pinned_primary_main': inputs['current_main_commit']}, ensure_ascii=False))
