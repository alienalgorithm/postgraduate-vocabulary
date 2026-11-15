"""Delivery-only scope. This never asserts all70 strict qualification."""
import hashlib,json,re
from pathlib import PurePosixPath
PRIMARY='alienalgorithm/postgraduate-vocabulary'
BACKUP='AlienCodes/literate-enigma'
TAG='all70-current-4k-delivery-three-audio-deferred-v1'
ZIP_NAME='01-70-4K-CURRENT-DELIVERY.zip'
LIMIT=2*1024**3
AUTH_SHA='bc6f4bc4a79e12aeb96acd1d64cd4f106325edcddfed12e386f9203332d37988'
AMENDMENT_SHA='ce771ae0749865b45fdd817940fc73a527150fe7361231059e486cdb1d7c784c'
DEFERRED={'24':'49','68':'53','56':'65'}
SOURCE_ORDER=['07','01','12','10','22','06','11','39','21','51','03','05','04','55','44','50','20','02','49','42','14','27','13','61','15','17','26','36','28','33','67','47','34','62','53','60','65','19','29','43','52','48','37','31','16','40','54','46','24','70','38','09','68','35','30','69','66','08','63','32','57','23','64','18','56','41','58','25','59','45']
class GuardError(ValueError):pass
def need(x,m):
 if not x:raise GuardError(m)
def sha(x):return hashlib.sha256(x).hexdigest()
def validate_manifest(c):
 need(c['kind']=='all70-immediate-existing-video-delivery-manifest' and c['tag']==TAG,'Wrong delivery-only namespace')
 need(c['latest_actual_user_authority_sha256']==AUTH_SHA and c['latest_immediate_no_extra_verification_amendment_sha256']==AMENDMENT_SHA and c['strict_all70_qualified'] is False,'Wrong authority or false strict claim')
 videos=c['videos'];need(len(videos)==70 and [v['source_id'] for v in videos]==SOURCE_ORDER,'Need exact70 sources in current090 order')
 need([v['current_video_order'] for v in videos]==[f'{x:02}' for x in range(1,71)],'Wrong video order')
 need(c['audio_review_deferred_source_ids']==['24','68','56'],'Only exact3 audio reviews may be deferred')
 for v in videos:
  need(v['release_name']==v['current_video_order']+' '+v['title_zh']+'.mp4' and PurePosixPath(v['release_name']).name==v['release_name'] and '\n' not in v['release_name'],'Wrong delivery filename')
  need(type(v['bytes']) is int and v['bytes']>0 and re.fullmatch('[0-9a-f]{64}',v['sha256']),'Wrong actual file identity')
  s=v['delivery_source'];need(s['repository'] in (PRIMARY,BACKUP) and re.fullmatch('[0-9a-f]{40}',s['commit']),'Unpinned or unknown media repository')
  p=s['repo_path'];need(isinstance(p,str) and not p.startswith('/') and '\\' not in p and '..' not in PurePosixPath(p).parts and p.endswith('.mp4'),'Wrong media path')
  need(v['delivery_version_status'] in ('qualified_final','source_QA_passed_existing_native','user_authorized_existing_version_audio_review_deferred','rendered_current_delivery_audio_review_deferred','user_authorized_existing_review_only_version_audio_review_deferred'),'Unknown actual version role')
  need(type(v['canonical_current_install_complete']) is bool and isinstance(v['tail_status'],str),'Missing honest current/tail role')
  if v['source_id'] in DEFERRED:
   need(v['current_video_order']==DEFERRED[v['source_id']] and v['audio_review_waived_by_latest_user'] is True and v['qualified_audio_passed'] is False and v['delivery_version_status'].endswith('audio_review_deferred'),'Deferred audio must not be called passed')
  else:
   need(v['audio_review_waived_by_latest_user'] is False and type(v['qualified_audio_passed']) is bool,'No other item may inherit the audio waiver')
   need(v['delivery_version_status'] in ('qualified_final','source_QA_passed_existing_native'),'Nondeferred file role is wrong')
  need(isinstance(v['provenance'],str) and bool(v['provenance']),'Actual role/provenance required')
 need(sum(v['delivery_version_status']=='qualified_final' for v in videos)==66,'Exactly66 existing qualified finals required for this delivery scope')
 need(videos[61]['source_id']=='23' and videos[61]['delivery_version_status']=='source_QA_passed_existing_native','Book62 must keep its existing sourceQA native role')
 need(sum(v['bytes'] for v in videos)==c['total_MP4_bytes'],'Wrong total bytes')
 need(len({v['release_name'] for v in videos})==70,'Duplicate filename')
 return videos

def inner_lists(all_videos,members,part_number,part_count):
 fields=['source_id','current_video_order','release_name','bytes','sha256','delivery_version_status','canonical_current_install_complete','tail_status','audio_review_waived_by_latest_user','qualified_audio_passed','provenance']
 rows=[{k:v[k] for k in fields} for v in all_videos]
 d={'kind':'all70-immediate-current-video-delivery-integrity-list','video_count':70,'strict_all70_qualified':False,'latest_actual_user_authority_sha256':AUTH_SHA,'latest_immediate_no_extra_verification_amendment_sha256':AMENDMENT_SHA,'audio_review_deferred_source_ids':['24','68','56'],'additional_audio_QA_and_probe_rechecks_skipped_by_latest_user_request':True,'MP4_bytes_preserved_without_reencoding':True,'videos':rows,'part_number':part_number,'part_count':part_count,'this_part_files':[v['release_name'] for v in members]}
 return (json.dumps(d,ensure_ascii=False,sort_keys=True,indent=2)+'\n').encode(),''.join(v['sha256']+'  '+v['release_name']+'\n' for v in all_videos).encode()

def exact_stored_zip_bytes(members, all_videos, part_number=1, part_count=1):
    """No ZIP comment/extra/descriptor: seekable ZIP_STORED local30+central46+names."""
    manifest, checksums = inner_lists(all_videos,members,part_number,part_count)
    entries = [(v['release_name'],v['bytes']) for v in members] + [
        ('MANIFEST.json',len(manifest)),('SHA256SUMS.txt',len(checksums))]
    need(all(len(name.encode('utf-8')) <= 65535 for name,_ in entries), 'ZIP filename is too long')
    return 22 + sum(size + 76 + 2*len(name.encode('utf-8')) for name,size in entries)

def archive_parts(videos):
    """Prefer the actual exact single ZIP; split only when that exact result cannot fit."""
    if exact_stored_zip_bytes(videos,videos) < LIMIT:
        return [videos]
    parts, current = [], []
    for v in videos:
        #70 is a two-digit upper bound for actual part IDs/count, not a guessed MB reserve.
        need(exact_stored_zip_bytes([v],videos,70,70) < LIMIT, 'One MP4 exceeds a Release asset budget')
        if current and exact_stored_zip_bytes(current+[v],videos,70,70) >= LIMIT:
            parts.append(current); current = []
        current.append(v)
    if current:
        parts.append(current)
    return parts
