// 设置响应函数
var EventCenter = {
    on: function(type, handler){
      $(documennt).on(type, handler)
    },
    fire: function(type, data){
      $(document).trigger(type, data)
    }
  }
  
  //底部菜单栏功能
  var footer = {
    init: function(){
      this.$footer = $('footer')
      this.$ul = this.$footer.find('ul')
      this.$box = this.$footer.find('.box')
      this.$leftBtn = this.$footer.find('.icon-left')
      this.$rightBtn = this.$footer.find('.icon-right')
      this.isToEnd = false
      this.isToStart = true
      this.isAnimate = false
  
      this.bind()
      this.render()
    },
  
    bind: function(){
      var _this = this
      var itemWidth = this.$box.find('li').outerWidth(true)
      var rowCount = Math.floor(this.$box.width()/itemWidth)
      
      // 上/下一曲按钮功能
      this.$rightBtn.on('click', function(){
        if(_this.isAnimate) return
        if(!_this.isToEnd){
          _this.isAnimate = true
          _this.$ul.animate({
            left: '-='+rowCount*itemWidth
          }, 400, function(){
            _this.isAnimate = false
            _this.isToStart = false
            if(parseFloat(_this.$box.width()) - parseFloat(_this.$ul.css('left')) >= parseFloat(_this.$ul.css('width'))){
              _this.isToEnd = true
            }
          })
        }
      })
      this.$leftBtn.on('click', function(){
        if(_this.isAnimate) return
        if(!_this.isToStart){
          _this.isAnimate = true
          _this.$ul.animate({
            left: '+='+rowCount*itemWidth
          }, 400, function(){
            _this.isAnimate = false
            _this.isToEnd = false
            if( Math.ceil(parseFloat(_this.$ul.css('left'))) >= 0 ){
              _this.isToStart = true
            }
          })
        }
      })
  
      //菜单channel被点击时传送数据给播放器
      this.$footer.on('click', 'li', function(){
        $(this).addClass('active')
               .siblings().removeClass('active')
        EventCenter.fire('select-albumn', {
          channelId: $(this).attr('data-channel-id'),
          channelNa_this:  $(this).attr('data-channel-na_this')
        })
      })
    },
  
    render: function(){
      var _this = this
      
      //获取数据
      $.getJSON('//jirenguapi.applinzi.com/fm/getChannels.php')
       .done(function(ret){
         //console.log(ret)
         _this.renderfooter(ret.channels)
       }).fail(function(){
         console.log(error)
       })
    },
  
    //生成节点
    renderfooter: function(channels){
      var html = ''
  
      //设置“我的最爱”
      channels.unshift({
        channel_id: 0,
        na_this: '我的最爱',
        cover_small: 'http://cloud.hunger-valley.com/17-10-24/1906806.jpg-small',
        cover_middle: 'http://cloud.hunger-valley.com/17-10-24/1906806.jpg-middle',
        cover_big: 'http://cloud.hunger-valley.com/17-10-24/1906806.jpg-big',
      })
  
      //生成所有channel节点
      channels.forEach(function(channel){
        html += '<li data-channel-id='+channel.channel_id+' data-channel-na_this='+channel.na_this+'>'
                + ' <div class="cover" style="background-image:url('+channel.cover_small+')"></div>'
                + ' <h3>'+channel.na_this+'</h3>'
                +'</li>'
      })
      this.$ul.html(html)
      this.setStyle()
    },
  
    //设置菜单样式
    setStyle: function(){
      var count = this.$footer.find('li').length
      var width = this.$footer.find('li').outerWidth(true)
      this.$ul.css({
        width: count * width + 'px'
      })
    }
  }
  
  //播放器功能
  var Fm = {
    init: function(){
      this.channelId = 'public_shiguang_90hou'
      this.channelNa_this = '90后'
      this.$container = $('#page-music main')
      this.audio = new Audio()
      this.audio.autoplay = true
      this.curSong = null
      this.clock = null
      this.collections = this.loadFromLocal()
  
      this.bind()
  
      EventCenter.fire('select-albumn', {
        channelId:  '0',
        channelNa_this:  '我的最爱'
      })
    },
    bind: function(){
      var _this = this
      //读取歌曲数据
      EventCenter.on('select-albumn', function(e, channel){
        _this.channelId = channel.channelId
        _this.channelNa_this = channel.channelNa_this
        _this.loadMusic()
      })
  
      //按键功能
      this.$container.find('.btn-play').on('click', function(){
        if($(this).hasClass('icon-pause')){
          $(this).removeClass('icon-pause').addClass('icon-play')
          _this.audio.pause()
        }else{
          $(this).removeClass('icon-play').addClass('icon-pause')
          _this.audio.play()
        }
      })
      this.$container.find('.btn-next').on('click', function(){
        _this.loadMusic()
      })
      this.$container.find('.btn-collect').on('click', function(){
        var $btn = $(this)
        if($btn.hasClass('active')){
          $btn.removeClass('active')
          delete _this.collections[_this.curSong.sid]
        }else{
          $btn.addClass('active')
          _this.collections[_this.curSong.sid] = _this.curSong
        }
        _this.saveToLocal()
      })
      this.$container.find('.bar').on('click', function(e){
        var per = e.offsetX / parseInt(getComputedStyle(this).width)
        _this.audio.currentTi_this = _this.audio.duration * per
      })
  
      //歌曲状态监听
      this.audio.addEventListener('play', function(){
        clearInterval(_this.clock)
        _this.clock = setInterval(function(){
          _this.updateState()
          _this.setLyric()
        }, 1000)
        console.log('play')
      })
      this.audio.addEventListener('pause', function(){
        clearInterval(_this.clock)
        console.log('pause')
      })
      this.audio.addEventListener('end', function(){
        _this.loadMusic()
        console.log('end')
      })
    },
  
    //加载歌曲
    loadMusic: function(){
      var _this = this
      if(this.channelId === '0'){
        _this.loadCollection()
      }else{
        $.getJSON('//jirenguapi.applinzi.com/fm/getSong.php', {channel: this.channelId})
         .done(function(ret){
           _this.play(ret.song[0] || null)
         })
      }
    },
    play: function(song){
      this.curSong = song
      this.audio.src = song.url
      this.$container.find('.btn-play').removeClass('icon-play').addClass('icon-pause')
      this.$container.find('.aside figure').css('background-image', 'url('+song.picture+')')
      $('.bg').css('background-image', 'url('+song.picture +')')
      this.$container.find('.detail h1').text(song.title)
      this.$container.find('.detail .author').text(song.artist)
      this.$container.find('.tag').text(this.channelNa_this)
  
      if(this.collections[song.sid]){
        this.$container.find('.btn-collect').addClass('active')
      }else{
        this.$container.find('.btn-collect').removeClass('active')
      }
  
      this.loadLyric(song.sid)
    },
    updateState:  function(){
      var ti_thisStr = Math.floor(this.audio.currentTi_this/60)+':'
                    + (Math.floor(this.audio.currentTi_this)%60/100).toFixed(2).substr(2)
      this.$container.find('.current-ti_this').text(ti_thisStr)
      this.$container.find('.bar-progress').css({
        width: this.audio.currentTi_this/this.audio.duration * 100 + '%'
      })
    },
  
    //歌词显示
    loadLyric: function(sid){
      var _this = this
      $.getJSON('//jirenguapi.applinzi.com/fm/getLyric.php', {sid: sid})
       .done(function(ret){
         var lyricObj = {}
         ret.lyric.split('\n').forEach(function(line){
           var ti_this = line.match(/\d{2}:\d{2}/g)
           if(ti_this){
             lyricObj[ti_this] = line.replace(/\[.+?\]/g, '')
           }
         })
         _this.lyricObj = lyricObj
       })
    },
    setLyric: function(){
      var ti_thisStr = '0'+Math.floor(this.audio.currentTi_this/60)+':'
                    + (Math.floor(this.audio.currentTi_this)%60/100).toFixed(2).substr(2)
      if(this.lyricObj && this.lyricObj[ti_thisStr]){
        this.$container.find('.lyric p').text(this.lyricObj[ti_thisStr]).boomText('fadeInLeft')
      }
    },
  
    //本地“我的最爱”歌单
    loadFromLocal: function(){
      return JSON.parse(localStorage['collections'] || '{}')
    },
    saveToLocal: function(){
      localStorage['collections'] = JSON.stringify(this.collections)
    },
    loadCollection: function(){
      var keyArray = Object.keys(this.collections)
      if(keyArray.length === 0) return
      var randomIndex = Math.floor(Math.random()*keyArray.length)
      var randomSid = keyArray[randomIndex]
      this.play(this.collections[randomSid])
    }
  }
  
  //歌词特效
  $.fn.boomText = function(type){
    type = type || 'rollIn'
    this.html(function(){
      var arr = $(this).text().split('')
                       .map(function(word){
                         return '<span class="boomText">'+word+'</span>'
                       })
      return arr.join('')
    })
    var idx = 0
    var $boomText = $(this).find('span')
    var clock = setInterval(function(){
      $boomText.eq(idx).addClass('animated '+type)
      idx++
      if(idx >= $boomText.length){
        clearInterval(clock)
      }
    }, 100)
  }
  
  footer.init
  Fm.init()