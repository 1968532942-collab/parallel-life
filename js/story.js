/* =========================================================
   story.js — 剧情数据（与渲染完全分离）
   beat 字段：
     shot   切换到场景内的某个镜头（叠化）
     cam    [焦点x%, 焦点y%, 缩放]  镜头推拉；camT 过渡秒数
     add/rm 给场景加/去状态标记（驱动 CSS 动画）
     lines  本拍逐段出现的文案
     act    互动：tap / hold / swipe / drag / pan / choice
            完成后执行 act.add / act.cam，等待 act.wait 毫秒自动进入下一拍
   ========================================================= */
window.STORY = {
  prologue: {
    scene: 'prologue',
    beats: [
      { shot: 'night', cam: [50, 50, 1], act: { type: 'hold', hit: 'envelope', hint: '长按信封，打开它', add: ['open'], wait: 1500, sfx: 'paper' } },
      { add: ['l1'], lines: [], letter: true },
      { add: ['l2'], letter: true },
      { add: ['l3'], letter: true },
      { add: ['l4'], letter: true },
      { add: ['l5'], letter: true, music: 1.2 },
      { shot: 'road', cam: [50, 46, 1.12], camT: 6, add: ['fork'], lines: ['一条路，在我面前慢慢分成了两个方向。'],
        act: { type: 'choice', options: [{ id: 'home', label: '留在家乡', sub: '熟悉的街道与灯火' }, { id: 'far', label: '奔赴远方', sub: '陌生城市里的光' }] } }
    ]
  },

  routes: {
    home: {
      name: '留在家乡', en: 'THE LIFE I STAYED',
      acts: [
        { id: 'h1', no: '第一幕', title: '又是一年桂花香', scene: 'osmanthus', beats: [
          { cam: [50, 56, 1.02], lines: ['下班路过那条熟悉的街道，突然闻到一阵桂花香。'] },
          { cam: [50, 30, 1.3], camT: 3.4, lines: ['我放慢脚步，抬头看了看。'] },
          { cam: [50, 46, 1.04], camT: 2.6, add: ['wind'], lines: ['风一吹，细小的桂花纷纷落下。'],
            act: { type: 'tap', hit: 'blossom', hint: '点一下飘落的桂花', add: ['catch'], wait: 4200, sfx: 'chime' } },
          { cam: [50, 58, 1.26], camT: 3, add: ['blur'], lines: ['我伸出手，接住了其中一朵。'] },
          { cam: [50, 60, 1.34], camT: 4, add: ['close'], lines: ['原来，又是一年秋天了。'] }
        ] },
        { id: 'h2', no: '第二幕', title: '下班后的晚风', scene: 'walk', beats: [
          { shot: 'walk', cam: [50, 54, 1.02], lines: ['晚饭后，我和家人出门散步。'],
            act: { type: 'tap', hit: 'family', hint: '点击家人，跟上他们', add: ['follow-family'], cam: [46, 56, 1.08], camT: 3, wait: 1300, sfx: 'step' } },
          { cam: [50, 56, 1.1], camT: 6, lines: ['一路聊着家常，不知不觉走到了以前读书的高中附近。'] },
          { shot: 'gate', cam: [50, 50, 1], add: ['bell'], sfx: 'bell', lines: ['正好赶上晚自习结束。'],
            act: { type: 'tap', hit: 'gate', hint: '点击校门', add: ['out'], cam: [50, 48, 1.16], camT: 3, wait: 1600, sfx: 'chime' } },
          { lines: ['学生们三三两两地走出校门，有人骑着自行车，有人和朋友说说笑笑。'] },
          { shot: 'flash', cam: [50, 50, 1], camT: 2, sfx: 'flash', music: 1.35, add: ['flashback'], lines: ['我站在路边，忽然想起很多年前，自己也曾这样背着书包，从这扇校门里走出来。'] },
          { cam: [50, 50, 1.02], camT: 5, lines: ['那时候总盼着快点长大。'] },
          { shot: 'gate', cam: [50, 52, 1.02], camT: 3, add: ['far'], music: 1, lines: ['没想到，现在的我，已经是一个下班后出来散步的大人了。'] }
        ] },
        { id: 'h3', no: '第三幕', title: '街角的那家面馆', scene: 'noodle', beats: [
          { shot: 'ext', cam: [50, 50, 1], lines: ['天气渐渐冷了。'] },
          { cam: [50, 48, 1.08], camT: 3, lines: ['下班后，我又去了那家从学生时代就常吃的面馆。'],
            act: { type: 'swipe', dir: 'left', hit: 'door', hint: '向左滑动，推开面馆的门', add: ['open'], cam: [50, 46, 1.5], camT: 1.6, wait: 1500, sfx: 'door' } },
          { shot: 'int', cam: [50, 50, 1.02], lines: ['老板好像比以前老了一些，但味道还是熟悉的味道。'],
            act: { type: 'tap', hit: 'menu', hint: '点菜单，要一碗熟悉的牛肉面', add: ['order'], wait: 1800, sfx: 'chime' } },
          { cam: [50, 52, 1.04], lines: ['旁边坐着几个刚放学的学生，边吃边讨论着考试。'],
            act: { type: 'tap', hit: 'bowl', hint: '点一下面碗', add: ['steam'], wait: 1400, sfx: 'chime' } },
          { cam: [50, 60, 1.3], camT: 4, lines: ['听着他们聊天，我忍不住笑了笑。'] },
          { cam: [50, 62, 1.42], camT: 4, lines: ['以前的我，也是这样。'] }
        ] },
        { id: 'h4', no: '第四幕', title: '樱花开的时候', scene: 'cherry', beats: [
          { cam: [50, 60, 1.02], lines: ['春天来的时候，家乡的樱花又开了。'],
            act: { type: 'tap', hit: 'tree', hint: '点击樱花树，抬头看看', cam: [50, 20, 1.55], camT: 3.2, wait: 2600, sfx: 'chime' } },
          { lines: ['路过那条熟悉的路，我忍不住停下脚步。'],
            act: { type: 'tap', hit: 'canopy', hint: '再点一下，等一阵风', add: ['wind'], wait: 1800, sfx: 'wind' } },
          { add: ['follow'], cam: [50, 60, 1.08], camT: 7, music: 1.3, lines: ['风一吹，花瓣轻轻落下来。'] },
          { lines: ['我站在树下，忽然觉得，原来留在这里的这些年，我也没有错过很多好看的春天。'] }
        ] },
        { id: 'h5', no: '第五幕', title: '原来，我也在慢慢长大', scene: 'montage', beats: [
          { shot: 'market', cam: [50, 52, 1.02], lines: ['又是一个普通的周末。'],
            act: { type: 'tap', hit: 'cart', hint: '点购物车，陪家人逛超市', add: ['cart'], wait: 1500, sfx: 'roll' } },
          { cam: [50, 52, 1.02], camT: 6, lines: ['上午陪家人去超市买东西，下午回家收拾房间，晚上一起做饭。'] },
          { shot: 'tidy', cam: [50, 50, 1.02], lines: ['以前总觉得这些事情很无聊。'],
            act: { type: 'tap', hit: 'laundry', hint: '帮妈妈一起叠衣服', add: ['tidy'], wait: 1500, sfx: 'cloth' } },
          { shot: 'kitchen', cam: [50, 48, 1.02], lines: ['现在却会主动帮忙，偶尔还能替家里解决一些麻烦。'],
            act: { type: 'tap', hit: 'pot', hint: '点锅，帮妈妈炒菜', add: ['kitchen'], wait: 1500, sfx: 'sizzle' } },
          { shot: 'sofa', cam: [50, 50, 1], add: ['phone'], lines: ['吃完晚饭，我坐在沙发上刷手机。'],
            act: { type: 'tap', hit: 'phone', hint: '点击手机', add: ['feed'], wait: 1200, sfx: 'tap' } },
          { lines: ['看到有人分享另一座城市的生活。'] },
          { add: ['feed2'], lines: ['热闹的街道、精彩的演出、从未见过的风景。'] },
          { add: ['zoom'], lines: ['我看了很久。', '忽然有些好奇：'] },
          { add: ['deep'], music: 1.35, lines: ['如果当年离开了家乡，现在的我，又会过着怎样的生活？'] }
        ] }
      ]
    },

    far: {
      name: '奔赴远方', en: 'THE LIFE I CHASED',
      acts: [
        { id: 'c1', no: '第一幕', title: '终于有了自己的小房间', scene: 'room', init: ['first'], beats: [
          { cam: [50, 50, 1], lines: ['来到这座城市的第一个星期，我几乎每天都在找房子。', '看了好几间，不是太贵，就是离公司太远。'] },
          { lines: ['最后，我租下了一间不大的房间。'],
            act: { type: 'drag', hit: 'suitcase', drop: 'dropzone', hint: '拖动行李箱，把它拉进房间', add: ['suitcase-in'], wait: 900, sfx: 'roll' } },
          { lines: ['搬进去那天，我拖着行李箱，来来回回收拾了很久。'],
            act: { type: 'tap', hit: 'bed', hint: '点击床铺，整理被褥', add: ['bedmade'], wait: 1000, sfx: 'cloth' } },
          { act: { type: 'tap', hit: 'suitcase-open', hint: '点击行李箱，把衣服挂起来', add: ['clothes', 'items'], wait: 1300, sfx: 'cloth' } },
          { lines: ['床铺好了，衣服挂起来了，桌上也摆好了自己喜欢的小东西。'] },
          { add: ['dusk'], lines: ['天渐渐黑了。'],
            act: { type: 'tap', hit: 'lamp', hint: '点击台灯，照亮房间', add: ['lamp', 'night'], wait: 1500, sfx: 'click' } },
          { cam: [56, 34, 1.16], camT: 4, lines: ['我坐在床边，看着窗外一栋栋亮起灯的高楼。'] },
          { cam: [50, 46, 1.04], camT: 3, lines: ['突然意识到，从今天开始，买菜、做饭、交房租，生活里的大事小事，都要自己操心了。'] },
          { add: ['phone'], lines: ['我打开手机，给家里发了一条消息：'],
            act: { type: 'tap', hit: 'send', hint: '点击发送', add: ['sent'], wait: 1400, sfx: 'send' } },
          { rm: ['phone'], cam: [50, 50, .96], camT: 6, lines: ['“我收拾好了，房间还不错。”', '虽然只是租来的，但这里终于有了一点家的样子。'] }
        ] },
        { id: 'c2', no: '第二幕', title: '陌生城市的末班地铁', scene: 'metro', beats: [
          { cam: [50, 50, 1], lines: ['刚来到这座城市的时候，我常常很晚才回家。', '有时候是加班，有时候只是想一个人在街上多走一会儿。'] },
          { lines: ['末班地铁里很安静。'],
            act: { type: 'tap', hit: 'window', hint: '点击车窗', add: ['reflect'], cam: [71, 32, 1.45], camT: 2.6, wait: 2200, sfx: 'chime' } },
          { lines: ['车窗上映出我的脸，外面是一栋接一栋掠过去的高楼和灯光。'] },
          { cam: [50, 50, 1.02], camT: 2, sfx: 'arrive', add: ['peek'], lines: ['我坐在角落里，听着列车到站的提示音，忽然有一点想家。'],
            act: { type: 'tap', hit: 'myphone', hint: '点击手机', add: ['phone', 'msg'], wait: 1500, sfx: 'msg' } },
          { lines: ['打开手机，看到家人发来的消息：', '“今天忙不忙？记得好好吃饭。”'],
            act: { type: 'tap', hit: 'reply', hint: '点击回复', add: ['replied'], wait: 1600, sfx: 'send' } },
          { add: ['slow'], lines: ['我盯着屏幕看了一会儿，回了一句：', '“挺好的，不用担心。”'] },
          { rm: ['phone'], add: ['stop', 'doors'], sfx: 'doors', music: .75, lines: ['下一站到了。'] },
          { cam: [92, 40, 1.9], camT: 5.5, add: ['leave'], music: 1.1, lines: ['我提起包，和人群一起走进了这座城市的夜色里。'] }
        ] },
        { id: 'c3', no: '第三幕', title: '终于听到了那场音乐会', scene: 'concert', beats: [
          { shot: 'ticket', cam: [50, 50, 1], add: ['phone'], music: .7, lines: ['周六晚上，我终于去看了那场期待很久的音乐会。'],
            act: { type: 'tap', hit: 'ticket', hint: '点击电子门票，检票入场', add: ['checked'], wait: 1600, sfx: 'chime' } },
          { shot: 'hall', rm: ['phone'], cam: [50, 52, 1], music: .85, lines: ['以前总觉得，那些演出离我的生活很远，好像只能隔着屏幕看看。', '可现在，我真的坐在这里了。'] },
          { add: ['dim'], camT: 3, music: .55, lines: ['灯光暗下来的那一刻，整个大厅都安静了。'],
            act: { type: 'tap', hit: 'stage', hint: '点击舞台', add: ['spot', 'play'], cam: [50, 40, 1.26], camT: 9, wait: 2400, music: 1.6, musicT: 5 } },
          { lines: ['熟悉的旋律响起来时，我坐在座位上，几乎忘了呼吸。'] },
          { cam: [50, 44, 1.12], camT: 5, lines: ['周围的人和我一样，认真听着台上的演出。', '那一瞬间，我突然觉得，当初决定来到这座城市，真好。'] },
          { shot: 'street', rm: ['play'], cam: [50, 50, 1], music: 1, lines: ['散场的时候，外面的夜风有点凉。', '我一个人慢慢往地铁站走。'],
            act: { type: 'tap', hit: 'walkon', hint: '点击街道，慢慢走向地铁站', add: ['streetwalk'], wait: 1500, sfx: 'step' } },
          { cam: [50, 52, 1.02], camT: 8, lines: ['路边的灯光映在地上，耳边仿佛还回荡着刚才的旋律。', '今晚的快乐，好像可以记很久。'] }
        ] },
        { id: 'c4', no: '第四幕', title: '一个人的周末', scene: 'gallery', beats: [
          { shot: 'gallery', cam: [50, 50, 1], lines: ['这周终于不用加班了。', '我给自己留了一整个下午，去逛一直想去的美术馆。'],
            act: { type: 'pan', stops: 3, hint: '左右滑动，慢慢逛展厅', wait: 600 } },
          { lines: ['没有人催我，也不用迁就谁的时间。'],
            act: { type: 'tap', hit: 'painting', hint: '点击这幅画，走近它', add: ['near'], cam: [50, 42, 1.32], camT: 3.4, wait: 2400, sfx: 'chime' } },
          { add: ['time'], lines: ['我在喜欢的画前站了很久，直到身边的参观者换了一批又一批。'] },
          { shot: 'cafe', cam: [50, 54, 1.02], lines: ['出来以后，又去了附近的一家咖啡馆。'],
            act: { type: 'tap', hit: 'cup', hint: '点一下咖啡杯', add: ['look'], cam: [50, 32, 1.22], camT: 3.6, wait: 2600, sfx: 'cup' } },
          { lines: ['坐在窗边，看着街上来来往往的人。', '忽然想起刚来这座城市的时候，连一个人出去吃饭都会觉得不自在。'] },
          { cam: [50, 40, 1.12], camT: 6, lines: ['现在倒是越来越喜欢这样的周末了。', '想去哪里就去哪里，想待多久就待多久。'] },
          { lines: ['原来，我已经慢慢学会了和自己相处。'] }
        ] },
        { id: 'c5', no: '第五幕', title: '这座城市，也有了我想见的人', scene: 'friends', beats: [
          { shot: 'table', cam: [50, 50, 1], lines: ['今天下班后，我和几个朋友约着一起吃夜宵。', '我们来自不同的地方，说着不同的口音，却总有聊不完的话题。'] },
          { add: ['orbit'], lines: ['有人吐槽工作，有人分享最近发现的好店。', '还有人突然提议，下个月一起去海边。'],
            act: { type: 'tap', hit: 'cups', hint: '点击杯子，一起碰杯', add: ['cheers'], wait: 1900, sfx: 'clink' } },
          { add: ['laugh'], lines: ['大家七嘴八舌地讨论起来，笑声几乎盖过了店里的音乐。'] },
          { add: ['ask'], rm: ['laugh'], lines: ['散场的时候，朋友问我：', '“下周有空吗？我们再约！”', '我笑着答应了。'] },
          { shot: 'night', cam: [50, 50, 1.02], lines: ['走在回家的路上，忽然意识到：'],
            act: { type: 'tap', hit: 'road', hint: '点击街道，一个人走回家', add: ['homeward'], cam: [50, 46, 1.1], camT: 6, wait: 1500, sfx: 'step' } },
          { cam: [50, 48, 1.16], camT: 8, lines: ['这座曾经一个人都不认识的城市，已经慢慢有了让我期待见面的人。'] }
        ] },
        { id: 'c6', no: '第六幕', title: '原来，我已经在这里生活了很久', scene: 'room', init: ['lived', 'night', 'dark', 'bedmade', 'clothes', 'items', 'suitcase-in', 'stowed'], beats: [
          { shot: 'corridor', cam: [50, 50, 1], lines: ['又是一个普通的工作日。', '下班后，我去了常去的超市，买了点水果和第二天要做的菜。', '回家的路上，顺手在楼下取了快递。'],
            act: { type: 'tap', hit: 'door', hint: '点击房门', add: ['dooropen'], cam: [50, 46, 1.4], camT: 1.4, wait: 1300, sfx: 'door' } },
          { shot: 'room', cam: [50, 50, 1], lines: ['走进出租屋，换鞋、开灯，把水果放进冰箱。'],
            act: { type: 'tap', hit: 'switch', hint: '点击开关，打开灯', add: ['ceil'], rm: ['dark'], wait: 1100, sfx: 'click' } },
          { lines: ['这一切熟练得不需要思考。'],
            act: { type: 'tap', hit: 'desk', hint: '点击桌面，放下水果', add: ['fruit'], wait: 1100, sfx: 'cloth' } },
          { add: ['phone'], lines: ['我洗完澡，窝在沙发上刷手机。'],
            act: { type: 'tap', hit: 'photo', hint: '点开这张旧照片', add: ['past'], rm: ['phone'], wait: 1600, sfx: 'flash', music: .6 } },
          { lines: ['偶然翻到刚来这座城市时拍的照片。', '那时候的房间空荡荡的，行李箱还摊在地上。'] },
          { rm: ['past'], add: ['now'], sfx: 'flash', music: 1.2, lines: ['而现在，窗台上多了绿植，冰箱里放着喜欢的食物，桌上还有前几天和朋友拍的照片。'] },
          { cam: [50, 42, 1.08], camT: 5, lines: ['我抬头看了看周围。', '突然发现，不知道从什么时候开始，我已经习惯了一个人在这里生活。'] },
          { lines: ['这座城市依然很大。', '但这里已经有了我熟悉的街道、常去的小店，还有想见的人。'] },
          { cam: [50, 50, .98], camT: 6, lines: ['原来，我真的在这里拥有了自己的生活。'] }
        ] }
      ]
    }
  },

  endings: {
    home: {
      title: '点灯人', en: 'THE LAMP KEEPER', sub: '原来，留下也是一种勇敢。', scene: 'endHome',
      lines: ['我闻过家乡每一年的桂花香，', '看过春天开满枝头的樱花。', '', '也曾在晚风里路过自己的高中，', '看着一群又一群年轻的身影走出校门。', '', '这些年，我偶尔也会羡慕远方的热闹，', '好奇另一种人生会是什么模样。', '', '可我同样拥有了许多珍贵的时刻。', '', '如果人生真的有另一条路，', '我希望那里的我，也能过得很好。', '', '而此刻，我想好好过完眼前的生活。'],
      poster: ['桂花、樱花与家里的灯火，', '都是我认真过好的日子。']
    },
    far: {
      title: '逐光者', en: 'THE LIGHT CHASER', sub: '原来，我真的走到了曾经向往的地方。', scene: 'endFar',
      lines: ['我曾拖着行李箱，', '一个人走进陌生的城市。', '', '也曾在深夜的地铁上，', '对着家人的消息偷偷想家。', '', '后来，我听到了期待已久的音乐会，', '看过喜欢的画展，', '也认识了一群有趣的新朋友。', '', '这里有过孤独，有过疲惫，', '也有很多不曾想象过的快乐。', '', '曾经陌生的街道，', '如今已经有了熟悉的路灯。', '', '那间最初空荡荡的小房间，', '也一点一点有了生活的模样。', '', '如果人生真的有另一条路，', '我希望那里的我，也过得很好。', '', '而此刻，我很庆幸，当初真的出发了。'],
      poster: ['那间最初空荡荡的小房间，', '也一点一点有了生活的模样。']
    }
  },

  finale: {
    scene: 'finale',
    lines: ['如果那天，我选择了另一条路。', '我也许会遇见不同的人。', '看见不同的风景。', '过着完全不一样的生活。', '可是人生没有办法同时走两条路。', '那些没有发生的故事，就留给另一个时空的我吧。', '而我，会继续走好眼前的路。']
  },

  letter: ['有时候，我也会想。', '如果那年，我没有做出那个决定。', '如果我去了另一座城市，或者留在了原来的地方。', '现在的我，会过着怎样的生活？', '这一次，我想亲自去看看。']
};
