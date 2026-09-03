#!/usr/bin/env python3
"""domains.py —— 一次扫几十个手艺域，报出哪些域的词还成堆。

★ 由来（2026-09-03）：
  第62篇之前三个题材连着薄——乔利伍德（可用词 27 而论点窄）、靛蓝（核心词全撞）、
  大富翁（monopoly／rent／board 全撞）。**每次都是先选题、再探词、再发现不行。**
  改为先扫域：一次探十二个域，殡葬 70% 排第四，从它里面选题，一稿成。
  **这个动作每篇都要做，手写太慢，且每次只探十二个。做成工具，一次扫全部。**

★★ 判据与 topic.py 闸门一同源：不在初中词表、不撞库（同形／同词元／同根）、词频 2.4—4.8。
  **报的是「域里还剩多少词」，不是「这篇论点能长出多少词」——后者仍归闸门一。**
  域满不等于题材成（南丁格尔域探到 76%，闸门一只报 12）；**但域空题材一定不成。**

用法：
  python3 scripts/domains.py            # 扫全部，按可用率排
  python3 scripts/domains.py 12         # 只看前 12
"""
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))

# ── 域表：每域十个最典型的实词。加域就加一行。─────────────────────────
DOMAINS = {
    "马戏与杂技": "trapeze acrobat juggler clown ringmaster tightrope tent sawdust menagerie stilts",
    "玩具与游戏": "marble hoop kite dice checkers puzzle doll jigsaw skittles spinning-top",
    "洗衣与肥皂": "laundry lye soap suds mangle washboard starch bleach wringer tub",
    "殡葬": "undertaker coffin hearse embalm mourner shroud cemetery pallbearer wake mortuary",
    "蜂与蜜": "hive apiary beekeeper swarm drone comb honeycomb nectar propolis smoker",
    "弓箭": "bowyer fletcher longbow yew arrow quiver nock fletching bracer draw",
    "铅字与排版": "compositor typesetting galley font kerning ligature stereotype linotype matrix proof",
    "钟楼与时钟": "clockmaker escapement pendulum mainspring dial verge gear cog winding chime",
    "马厩与骑术": "stable groom saddle stirrup bridle bit rein hoof farrier gelding",
    "蒸汽机": "boiler piston flywheel governor condenser valve gauge firebox stoker crank",
    "牙医": "dentist molar enamel cavity drill filling extraction gum abscess plaque",
    "玻璃吹制": "blowpipe gob marver pontil annealing cullet batch gather shear furnace",
    "屋顶与瓦": "thatch slate batten gutter shingle rafter eave dormer purlin lath",
    "染坊": "indigo madder woad dyer alum tannin vat mordant fixative hue",
    "制鞋与皮革": "awl welt tanner cobbler vamp last insole heel stitch hide",
    "灯塔与航标": "lighthouse lens beacon keeper wick lantern fog foghorn reef lightship",
    "井与水泵": "well borehole windlass bucket aquifer trough cistern spring pump siphon",
    "面包与烘焙": "yeast leaven oven kneading crust crumb dough baker rye sourdough",
    "监狱与刑罚": "gaol warder cell treadmill transportation hulk convict gallows pillory stocks",
    "盐场": "brine pan evaporation saltworks salter crystal marsh pump lick grain",
    "磨坊与面粉": "millstone chute bran sieve grist husk hopper quern miller bolting",
    "渔业与网": "trawl seine mesh weir hatchery smack trap buoy net creel",
    "铁匠与铸造": "anvil forge bellows tongs quench temper slag mould crucible smith",
    "造纸与印刷": "pulp vat mould deckle watermark ream quire folio typeface galley",
    "医院与护理": "matron ward splint gurney lint swab gauze orderly sewer ventilation",
    "果园与嫁接": "graft scion rootstock budding orchard cordon espalier pruning cider seedling",
    "香料与商栈": "nutmeg mace clove pepper godown bale caravan spice cinnamon saffron",
    "法庭与诉讼": "bailiff remand injunction depose surety recess writ plea verdict docket",
    "皮革与马具": "harness collar yoke thong awl saddler girth breeching trace hame",
    "邮驿与信使": "courier relay postbag franking cipher packet dispatch stamp postmaster mailbag",
    "陶瓷": "kiln glaze slip biscuit potter wheel throwing clay porcelain crackle",
    "酿酒": "mash wort hops cask brewer malt ferment yeast bung tap",
    "航海": "keel rudder mast rigging bilge helm anchor hull galley bosun",
    "矿井": "shaft seam adit winding pithead collier pick lamp firedamp gallery",
    "纺织": "loom shuttle warp weft spindle bobbin carding fleece dyer weaver",
    "军营": "barracks sentry musket bayonet regiment drill parade rations bugle quartermaster",
    "教堂": "nave chancel pew altar pulpit steeple crypt vestry sexton belfry",
    "农庄": "plough furrow harrow sickle scythe thresh sheaf tithe fallow barn",
    "剧场": "stage wings prompt footlights curtain gallery pit box playbill flies",
    "药房": "apothecary pestle mortar tincture pill dispensary vial dose remedy elixir",
    "银行与账房": "ledger clerk quill blotter counting-house bullion vault teller draft usury",
    "屠宰与肉铺": "butcher cleaver shambles offal tallow hook carcass tripe brine flitch",
    "钟表匠": "watchmaker balance hairspring jewel escapement fusee mainspring bezel winding lever",
    "天文台": "telescope lens observatory meridian transit eyepiece mount star chart almanac",
    "海关与港口": "customs quay wharf bond warehouse tariff excise duty smuggler lading",
}


def scan(top=None):
    from agent import load, used_index, norm, stem, kin
    from wordfreq import zipf_frequency as z
    arts = load()
    exact, stems, _ = used_index(arts, None)
    basic = set(open(os.path.join(ROOT, "data/reference/basic-wordlist.txt"),
                     encoding="utf-8").read().split())

    def usable(w):
        if w in basic or w.rstrip("s") in basic:
            return False
        if norm(w) in exact or stem(w) in stems:
            return False
        if any(kin(w, x) for x in exact):
            return False
        return 2.4 < z(w, "en") < 4.8

    rows = []
    for name, words in DOMAINS.items():
        ws = words.split()
        ok = [w for w in ws if usable(w)]
        rows.append((len(ok) * 100 // len(ws), name, ok))
    rows.sort(reverse=True)
    print("=" * 66)
    print("各手艺域还剩多少词（%d 个域，与闸门一同一判据）" % len(DOMAINS))
    print("=" * 66)
    for pct, name, ok in rows[:top] if top else rows:
        bar = "█" * (pct // 10) + "░" * (10 - pct // 10)
        print("  %-8s %s %3d%%  %s" % (name, bar, pct, " ".join(ok[:7])))
    print("-" * 66)
    print("**★ 域满不等于题材成：南丁格尔域 76%，闸门一只报 12。**")
    print("**★★ 但域空题材一定不成：靛蓝、大富翁的核心词全撞，在这里就能看出来。**")
    print("**下一步：从前几名的域里找有真反转的题材，写材料，跑 topic.py 三门。**")


if __name__ == "__main__":
    scan(int(sys.argv[1]) if len(sys.argv) > 1 else None)
