"""Prepare a review manifest from the actually streamed existing-video inventory; no remote writes."""
import hashlib
import json
from pathlib import Path

from publish_review import HERE, TAG, ZIP_NAME, validate_manifest

INVENTORY_SHA = '6f5414f7d24e0b210f34217aa8e305b9bb4c53196f34c6925d27dba55f1b9ce4'


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def main():
    ip = HERE / 'ACTUAL-EXISTING-VIDEO-INVENTORY.json'
    assert sha(ip) == INVENTORY_SHA
    inventory = json.loads(ip.read_text())
    assert inventory['actual_available_primary_count'] == inventory['requested_count'] == 34
    assert inventory['current_actual_full_V3_passed_count'] == 24
    assert inventory['historical_full_QA_pending_count'] == 10
    manifest = {
        'kind': 'explicitly_requested_existing_video_individual_review_release',
        'user_scope_record': '078',
        'requested_book_range': ['37','70'],
        'requested_video_count': 34,
        'actual_available_video_count': 34,
        'requested_video_range_complete': True,
        'all34_final_or_full_QA_passed_claimed': False,
        'current_round_individual_user_final_acceptance_count': 0,
        'inherited_complete_full_V3_passed_count': 24,
        'historical_video_pending_current_full_QA_count': 10,
        'new_rendering_or_audio_editing_performed': False,
        'current_final_aliases_changed': False,
        'uniform_0_6_second_tail_claimed_for_this_review_release': False,
        'release_tag': TAG,
        'zip_name': ZIP_NAME,
        'release_prerelease': True,
        'release_title': '考研学人｜第37—70篇·逐篇核查版｜34篇现有4K视频',
        'release_body': '按要求整理第37—70篇，共34篇现有4K视频，供逐篇核查。\n\n保留现有视频原始内容、配音与转场，不重新编码。24篇沿用已通过完整核验的现有归档视频；另10篇沿用此前发布的历史视频，完整核验及逐篇定稿仍待完成。具体版本、来源与审核状态逐条列在压缩包内MANIFEST.json。\n\n本次为核查版，不代表34篇均已定稿，也不宣称它们均已加入统一0.6秒停留。后续按逐篇确认制作最终版。旧版本与修改记录保留。',
        'total_video_bytes': inventory['total_video_bytes'],
        'videos': inventory['videos'],
        'actual_existing_video_inventory_sha256': INVENTORY_SHA,
        'source_order_metadata_sha256': inventory['source_order_metadata_sha256'],
        'current_archive_inventory_sha256': inventory['current_permanent_archive_inventory_sha256'],
        'publisher_program_sha256': sha(HERE / 'publish_review.py'),
    }
    validate_manifest(manifest)
    output = HERE / 'MANIFEST.json'
    if output.exists():
        assert json.loads(output.read_text()) == manifest, 'Do not overwrite a frozen actual manifest.'
    else:
        output.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'manifest': str(output), 'bytes': output.stat().st_size, 'sha256': sha(output), 'remote_mutations_performed': False}))


if __name__ == '__main__':
    main()
