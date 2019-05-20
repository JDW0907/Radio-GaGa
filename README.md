# Radio-GaGa
本项目是一个简易的音乐电台网页，页面主要分为播放板块Main与菜单栏footer：
### 项目功能
1. 实现了音乐播放器的基本功能（播放/暂停、下一曲、进度显示）；
2. 播放时能自动获取歌曲图片并加载；
3. 点击进度条能够调整歌曲进度；
4. 点击菜单栏的图片能够自动切换播放频道；
5. 实现了本地收藏功能；
6. 实现了歌词同步播放功能

**技术细节**

1. 响应式布局
页面布局均以显示器高度单位vh为基准，在任何尺寸下，页面高度都能刚好撑满整个窗口，同时水平方向上则选取了几个典型尺寸，进行媒体查询。
2. JS功能组合与分离
- JS文件主要编写了菜单栏功能函数对象Footer与播放器功能函数对象App，二者分别实现各自的功能，耦合程度极低。
- JS封装了一个事件发布监听函数对象EventCenter，使二者之间产生关联：Footer只负责监听用户的频道选择，并通过EventCenter.fire发布相关信息；Fm只通过EventCenter.on监听EventCenter.fire发布的相关信息，并做相应的加载。

3. 歌词同步加载
获取到当前播放歌曲的歌词数据后，逐行分隔，提取歌词中的时间部分，与歌曲当前播放时间进行匹配，输出去除时间后的歌词文本，并进一步实现歌词特效
4. 本地收藏功能
页面通过监听收藏按钮的点击，将当前播放歌曲的信息保存至本地，当用户选择“我的最爱”频道时，从本地加载保存的歌曲信息。
遇到的问题

### 项目中遇到的问题及解决方法
- 从服务器获取数据受限，使用的API不允许外链访问：需在`<head>`里加上
```
<meta name="referrer" content="never">
```
从而让服务器认为访问者为直接打开播放音乐，避免无法获取数据。
- 菜单栏切换键点击过快会出错：需要为切换效果加一个定时器，避免该情况出现

### 项目收获
1. 初步熟悉响应式布局的编写；
2. 对JS的函数封装、模块化、功能分离、代码复用等概念有了进一步了解；
3.进一步熟悉了HTML、CSS与JS文件的代码编写；

### 项目技术栈关键字
- jQuery
- CSS3 动画
- 响应式布局
- JSONP

