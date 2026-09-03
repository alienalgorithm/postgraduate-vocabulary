#!/usr/bin/env python3
"""topics.py —— 题材库：每个候选题材带一句反转和反转段的十个物件，一次跑完全部，按通过率排。

★ 由来（2026-09-03）：
  第68篇之前一天里选题成功率从 1:1 掉到 1:3——乙醚、切片面包、蜂路、病房、纯净法都是先查事实、再手跑 vet 才发现物件被占。
  `domains.py` 扫的是每域十个通用词，不预测题材真正要用的那十个物件。
  **这里把「先 vet 反转段的十个物件」从手工变成扫描：几十个候选题材一次跑完，只去核排在前面的。**

★★ 判据与 agent.py vet 同源（撞库／初中表／词频 2.4—4.8）。
  **通过率 <50% 的题材直接跳过；≥60% 的才值得去核事实、写材料。**
  **物件列表要写「反转段」要用的词，不是通说段的**——通说段与末段可以换域填，反转段空了就写不成。

★★★ 加题材就加一行：(名字, 一句反转, "十个物件")。已成稿或已存档的题材标 done=True，扫描时跳过。

用法：
  python3 scripts/topics.py           # 扫全部未做的，按通过率排
  python3 scripts/topics.py 8         # 只看前 8
  python3 scripts/topics.py --all     # 含已做的（看词被占了多少）
"""
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))

# ── 题材库 ─────────────────────────────────────────────────────────────
# (名, 反转一句, 反转段十个物件, done)
TOPICS = [
    # ── 已成稿（留着量词被占了多少）──
    ("鳕鱼崩溃", "存量估计靠拖网船捕捞率，感觉不到鱼在变少", "dory jig trap trawl sonar inshore offshore biomass moratorium skipper", True),
    ("服丧礼俗", "规矩是一家绉纱厂的销售条款", "crepe veil bonnet gloves stationery furs velvet satin lilac mauve", True),
    ("泰迪熊", "纪念的是漫画家画出来的那个下午", "hounds waterhole willow knife carcass caricature ink button mohair storefront", True),
    ("产钳", "守的不是器械是它看起来的大小", "forceps blades spoons pelvis blindfold bell attic floorboards trap-door satchel", True),
    ("红衣军", "红是最便宜的染料，军衔在染料里", "madder carmine alum mordant breeches waistcoat knapsack musket khaki vats", True),
    ("茅草大火", "茅草 1212 年就禁了", "thatch tile shingle boards plaster aldermen wattle tar tallow jetties", True),
    ("拼图", "头 150 年是地理教具", "mahogany veneer sawed borders atlas governess cabinet coastline cardboard die-cut", True),
    # ── 已存档（词不够或三型）──
    ("刺刀", "刺刀伤不到 2%", "bayonet musket volley lint gauze splint breach ambush canister spear", True),
    ("洗衣机", "家务时间没减", "copper washboard mangle wringer lye suds starch bleach clothesline detergent", True),
    ("纯净法", "是限价令与粮食配给", "hops malt rye loaves grist herbs soot nettle innkeeper confiscation", True),
    ("乙醚", "加橙油改名申请专利", "ether inhaler sponge dentist tooth tumour scalpel patent nostrum royalties", True),
    # ── 候选（未核事实，先扫词）──
    ("人体炮弹", "炮里是弹簧和压缩空气，火药只是响", "cannon barrel spring net helmet flash powder muzzle recoil crash-mat", False),
    ("飞刀", "靶上的人不动，刀手也不瞄人", "dagger target blindfold spin hilt wheel assistant throw plank tip", False),
    ("跳蚤马戏", "跳蚤是真的，套着铜丝", "flea harness wire chariot tweezers magnifier cannon carousel jump collar", False),
    ("长矛比武", "比武是表演，铠甲专为它做", "lance tilt visor helm shield saddle stirrup joust barrier splinter", False),
    ("弩", "弩不是被禁的，是被买的", "crossbow bolt windlass stirrup quarrel trigger prod string rampart siege", False),
    ("弓箭手", "长弓不是英格兰的，是威尔士的", "longbow yew arrow quiver fletching bracer nock string draw butts", False),
    ("盔甲重量", "全身板甲比现代步兵负重轻", "plate visor gauntlet greave cuirass helm mail rivet hinge squire", False),
    ("护城河", "六千道护城河几乎没有一道属于城堡，是乡绅用土方说出的身份", "moat ditch drawbridge rampart palisade keep bailey portcullis causeway silt", True),
    ("灯塔", "灯塔的灯是用油和透镜省出来的", "lighthouse lens wick lantern keeper beacon fog reef prism clockwork", False),
    ("信鸽", "鸽子送的是股价不是军情", "pigeon loft roost coop message capsule leg ring homing basket release", False),
    ("驿站马车", "驿站的快是换马不是快马", "coach postilion stage relay ostler inn yard horn whip harness", False),
    ("石板路", "狄更斯的鹅卵石街是维多利亚花岗岩块，为马蹄抓地；安静路面马会摔", "cobble cobblestone kerb gutter hoof cartwheel rut paving setts flagstone", True),
    ("烟囱清扫", "1875 年法案加的只是执照与警察，禁令已三十五年", "chimney flue soot sweep brush climbing-boy scraper hearth cowl damper", True),
    ("煤气灯", "煤气灯照亮的是商店橱窗不是街道", "gaslight lamplighter mantle burner main meter retort coke tar jet", False),
    ("冰窖", "冰是从湖里锯出来运到印度的", "ice icehouse sawdust block pond saw tongs sledge insulation cargo", False),
    ("蜡烛", "鲸油蜡烛不是最亮的，是最贵的", "candle tallow wick wax spermaceti mould dip snuff taper chandler", False),
    ("肥皂", "肥皂税让英国人一百年不洗澡", "soap lye tallow ash kettle bar suds lather scum excise", False),
    ("假发", "假发是为了跳蚤不是为了体面", "wig periwig powder pomade curl queue barber lice scalp shaving", False),
    ("扣子", "纽扣的发明比扣眼晚了三千年", "button buttonhole toggle brooch pin clasp loop shank mould thread", False),
    ("手帕", "手帕是为了鼻烟不是为了眼泪——鼻烟一侧 nostril/sniff/snuffbox 全撞，零稿", "handkerchief snuff lace hem monogram pocket sleeve embroidery linen wave", True),
    ("雨伞", "伞在伦敦被嘲笑了三十年", "umbrella parasol rib canopy ferrule whalebone oiled-silk handle spoke drizzle", False),
    ("风车", "荷兰风车多数是排水不是磨面", "windmill sail cap millstone polder sluice scoop pump drainage vane", False),
    ("运河", "运河船是马拉的，速度靠马不靠水", "canal barge towpath lock horse tow-rope wharf aqueduct tunnel leg", False),
    ("驿马邮政", "Pony Express 只跑了十八个月", "pony rider saddle mochila relay station telegraph mailbag stirrup gallop", False),
    ("罐头", "罐头比开罐器早四十八年", "tin can solder opener bayonet hammer chisel sailor ration rust", False),
    ("火柴", "安全火柴安全的是盒子不是火柴", "match phosphorus striker box tipping sulphur splint jaw factory girl", False),
    ("铅笔", "铅笔里从来没有铅", "pencil graphite cedar clay kiln shaft eraser sharpener mine Borrowdale", False),
    ("怀表", "怀表的链子是为了偷不是为了挂", "watch chain fob pocket pickpocket waistcoat winder crystal escapement", False),
    ("领带", "领带是克罗地亚雇佣兵的围巾", "cravat scarf knot collar mercenary regiment neckcloth silk starch stock", False),
    ("螺旋楼梯", "顺时针为守方右手持剑是后来编的，三成城堡是逆时针", "staircase newel tread riser spiral clockwise anticlockwise landing banister stairwell", False),
    ("沙漏", "沙漏里从来不是沙；最早的确证是 1345 年一张船上收据——bells/grains/trickle/receipt 全撞，零稿", "hourglass bulb neck eggshell marble powder glassblower cork sieve watch-glass", True),
    ("牛眼玻璃", "牛眼玻璃是吹圆盘时最贱的中心废料，如今当古董卖", "bullseye pane pontil crown glazier disc glasshouse cottage-window casement leading", False),
    ("壁炉税", "1662 年壁炉税让穷人堵上烟囱，一屋子烟", "hearth-tax fireplace chimney-money assessor exemption cottage smoke-hole soot collector rebellion", False),
    ("鹅毛笔", "鹅毛笔用的是左翅的羽毛，因为弯向右手", "quill goose feather barrel nib penknife inkwell blotting-paper left-wing scribe", False),
    ("门环与门铃", "门环的响法是一套暗号：几下、谁在敲", "knocker doorbell footman rapping caller card-tray butler porter visiting-card", False),
    ("窗税", "窗税让英国人砌掉窗户，daylight robbery 由此而来", "window-tax bricked-up sash glazing assessor daylight dormer attic collector loophole", False),
    ("木鞋", "木鞋不是穷人的鞋，是湿地作业鞋", "clog sabot alder sole strap cobbler upper hobnail mill-floor puddle", False),
    ("稻草人", "稻草人顶替的是一个十一岁的赶鸟童", "scarecrow straw sack turnip broomstick crow sparrow rook clapper bird-boy", True),
    ("风向鸡", "教堂顶上的公鸡是教皇 9 世纪下的令", "weathercock steeple rooster vane gilt spire pivot compass-points gust sacristan", False),
    ("羽毛床", "羽毛床是嫁妆里最贵的一件", "featherbed mattress ticking down goose-down bolster dowry bedstead flea straw-pallet", False),
    ("熨斗", "熨的不是皱，是虱子", "flatiron sad-iron trivet goffering starch pleat crease louse laundress hearth-iron", False),
    ("门牌号", "门牌号是为征兵不是为送信", "house-number numbering doorpost conscription billeting census postman street-name enumerator chalk", False),
    ("牛铃", "牛铃是给牧人听的，不是给牛戴的", "cowbell clapper collar herd pasture alpine transhumance forge strap tinkle", False),
    ("烛芯剪", "烛芯剪是最常用的家用工具，因为烛芯不会自己烧掉", "snuffers wick candle tallow soot guttering trimming chandelier taper sconce", False),
    ("台球桌", "台球是草地游戏搬进屋里，桌面绿是草的绿", "billiard cue cushion baize chalk pocket ivory ball mace lawn", False),
    ("扑克牌", "扑克牌的四种花色是社会的四个等级", "playing-card suit spade club heart diamond woodblock stencil knave ace", False),
    ("骰子", "骰子从来是最公平的，因为作弊太容易被发现", "dice pip loaded shaved knucklebone cup tumble gamester ivory bone", False),
    ("傻瓜帽", "dunce 来自中世纪最锋利的哲学家邓斯·司各脱", "dunce cone cap stool corner slate cane inkwell desk schoolmaster", False),
    ("教堂长凳", "长凳是私产：带门带锁、买卖继承、穷人站着", "pew box-pew door lock cushion hassock gallery nave aisle deed", False),
    ("板球拍", "板球拍原本像曲棍球棒，因为球是沿地滚的", "bat willow blade handle crease wicket stumps bails bowler underarm", False),
    ("滑铁卢假牙", "「滑铁卢牙」是个牌子，货来自坟墓与绞架——可用 24，§3 论证段空，一稿即停", "denture ivory hippopotamus walrus plate spring rivet gum molar grave-robber", True),
    ("烤肉狗", "转烤肉叉的是一种狗，跑在轮子里", "turnspit spit roast jack wheel treadmill kitchen-dog hearth cook drippings", False),
    ("符木", "1834 年国会烧掉了，因为财政部在炉子里烧六百年的符木", "tally notch stock foil hazel exchequer furnace stove clerk cartload", False),
    ("燧石打火", "火柴之前，生火是一门要练的手艺", "tinderbox flint steel char-cloth spark tinder striker touchwood spill bellows", False),
    ("醋", "醋不是坏了的酒，是故意做的", "vinegar mother cask acetic cider malt pickling barrel sourness brewer", False),
]


def scan(top=None, show_all=False):
    from agent import load, used_index, norm, stem, kin
    from wordfreq import zipf_frequency as z
    arts = load()
    exact, stems, _ = used_index(arts, None)
    basic = set(open(os.path.join(ROOT, "data/reference/basic-wordlist.txt"),
                     encoding="utf-8").read().split())

    def usable(w):
        w = w.lower()
        if w in basic or w.rstrip("s") in basic:
            return False
        if norm(w) in exact or stem(w) in stems:
            return False
        if any(kin(w, x) for x in exact):
            return False
        return 2.4 < z(w, "en") < 4.8

    rows = []
    for name, rev, words, done in TOPICS:
        if done and not show_all:
            continue
        ws = words.split()
        ok = [w for w in ws if usable(w)]
        bad = [w for w in ws if w not in ok]
        rows.append((len(ok) * 100 // len(ws), name, rev, ok, bad, done))
    rows.sort(key=lambda r: -r[0])
    print("=" * 70)
    print("题材库扫描 · 反转段十个物件的通过率（%d 个题材）" % len(rows))
    print("=" * 70)
    for pct, name, rev, ok, bad, done in rows[:top] if top else rows:
        mark = "✓" if pct >= 60 else ("·" if pct >= 50 else "✗")
        tag = "（已做）" if done else ""
        print("  %s %-6s %3d%%  %s%s" % (mark, name, pct, rev, tag))
        print("      可用 %s" % " ".join(ok))
        if bad:
            print("      撞／基础／生僻 %s" % " ".join(bad))
    print("-" * 70)
    print("**★ ✓ ≥60% 才去核事实写材料；✗ <50% 直接跳过——这一步零稿即停。**")
    print("**★★ 物件列表写的是反转段要用的词；通过了也仍须 topic.py 三门按段报。**")


if __name__ == "__main__":
    args = [a for a in sys.argv[1:]]
    show_all = "--all" in args
    nums = [int(a) for a in args if a.isdigit()]
    scan(nums[0] if nums else None, show_all)
