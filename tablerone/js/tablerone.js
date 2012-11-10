/* *************************************************
 *
 *    Tablerone - table interface
 *    
 *
 * *************************************************
 */


var tl = {};

tl.model = function(){ 
    return {    

    id : "",
    data : {},
    thead : "",
    tdata : "",
    
    filter : false,

    sort : {
        enabled : false,
        title : '',
        order : ''
    },

    pages : {
        enabled :    false,
        sortOrder :  '',
        firstPage :  1,
        lastPage :   18,
        pagePeriod : 6,
        currPage :   1,
        gap :        true
    },

    url : {
        url : '',
        param : '',
        sort : '',
        order : '',
        page : '1',
        filter : '',
        type : '',

        get : function() {
            for (var key in this){
                this[key] = this.getParam(key);
            }
        },

        set : function(key, value){
            this[key] = value;
        },

        getParam : function(name){
            return decodeURIComponent(
                (location.search.match(RegExp("[?|&]" + name + "=(.+?)(&|$)"))||[,""])[1]);
        },

        setParam : function(param, paramVal) {
            var url = window.location.href,
                newAddURL = "",
                tempArr = url.split("?"),
                baseURL = tempArr[0],
                addURL = tempArr[1];

            if (addURL) {
                tempArr = addURL.split('&');

                for (var i = 0; i < tempArr.length; i++) {
                    if (tempArr[i].split('=')[0] != param) {
                        newAddURL += '&' + tempArr[i];
                    } else {
                        newAddURL += '&' + param + '=' + paramVal;
                    }
                }
            } else {
                newAddURL += param + '=' + paramVal;
            }

            if (newAddURL.indexOf(param) === -1) {
                newAddURL += '&' + param + '=' + paramVal;
            }

            var newURL = (baseURL + "?" + newAddURL).replace('?&', '?');
            newURL.replace('#', '');

            this.param = newAddURL.replace('?&', '');
            this.param = this.param.replace(/^&+/, "");

            window.history.pushState({}, "", newURL);
        }
    },

    setData : function(data){
        this.thead = data.thead;
        this.tdata = data.tdata;
    },

    init : function(obj){
        this.id = obj.id;
        this.url.url = obj.url;
        
        this.filter.enabled = (obj.filter) ? obj.filter.enabled : false;
        this.sort.enabled = (obj.sort) ? obj.sort.enabled : false;
        this.pages.enabled = (obj.pages) ? obj.pages.enabled : false;
    }

    }
};

tl.util = {
    isInt : function(input){
        return ((input - 0) == input && input % 1==0);
    }
};

tl.data = {
    url : '',
    param : '',

    setParam : function(obj) {
        this.url = (obj.url) ? obj.url : '';
        this.param = (obj.param) ? obj.param : '';
    },

    get : function(callback, scope){
        $.ajax({
            url :      this.url,
            type :     "post",
            data :     this.param,
            dataType : "json",
            async :    true,
            beforeSend : function()
            {
              
            },
            success : function(data) 
            {
                callback.call(scope, data);
            },

            statusCode: 
            {
                404: function() {
                    alert("Page not found (Error 404)");
                },
                500: function() {
                    alert("Server problem (Error 500)");
                }
            }
        });
    }
};

tl.router = {

    me : {},

    filter : function(){
        if (this.me.model.filter.enabled) { 
            this.me.view.renderFilter(); 
        }
    },

    pages : function(){
        if (this.me.model.pages.enabled) { 
            this.setPage( this.me.model.pages.currPage, false ); 
        }
    },

    setSortOrder : function(title, el) {
        var m = this.me.model,
            d = this.me.data,
            v  = this.me.view,
            order = m.sort.order;

        if (order === 'asc' && m.sort.title === title) {
            order = 'desc';
        } else {
            order = 'asc';
        }

        this.me.model.sort.title = title;
        this.me.model.sort.order = order;

        m.url.set('sort', title);
        m.url.set('order', order);
        m.url.setParam('sort', title + '=' + order);

        d.setParam(m.url);
        d.get(this.setData, this);

        v.setSortOrder(order, el, m.id);
    },

    setPage : function(p, replace) {
        var m = this.me.model,
            v = this.me.view,
            o = m.pages;
        
        p = parseInt(p);

        m.pages.currPage = p;
        m.url.setParam("page", p);

        if (p >= o.firstPage + o.pagePeriod) {
            o.firstPage = p;
            if ( (p + o.pagePeriod) > o.lastPage ) {
                o.gap = false;
                o.firstPage = o.lastPage - o.pagePeriod;
            }
        } 
        else if (p < o.firstPage) {
            o.firstPage = p - o.pagePeriod + 1;
            o.gap = true;
            if ((p - o.pagePeriod) < 0) {
                o.firstPage = 1;
            }
        }

        v.renderPages( o, replace, m.id );
        this.onPageClick();
    },

    onSortClick : function() {
        var me = this;

        function onSortClickEvent() {
            var title = $(this).attr('data-title');
            me.setSortOrder(title, this);
        }

        $('.table-tablerone thead span').on('click', onSortClickEvent);
    },

    onPageClick : function() {
        var me = this;

        function onPageClickEvent() {
            var p = this.innerHTML,
                util = me.me.util,
                currPage = me.me.model.pages.currPage;

            if (util.isInt(p)) {
                me.setPage(p, true);

            } else if ( p.indexOf('Ctrl') > 0) { // prev
                me.setPage(currPage - 1, true);

            } else if ( p.indexOf('Ctrl') == 0 ) { // next
                me.setPage(currPage + 1, true);

            }
            return false;
        }

        $('.pagination li:not(.disabled) a').on('click', onPageClickEvent);
        $('.pagination li.disabled a').on('click', function(){ return false; });
    },

    events : function() {
        if (this.me.model.sort) {
            this.onSortClick(); 
        }

        if (this.me.model.pages) {
            this.onPageClick();
        }

        $('td a').on('click', function(){ return false; });
    },

    setData : function(data) {
        var m = this.me.model,
            v = this.me.view;

        m.setData(data);

        v.renderThead( m.thead );
        v.renderTbody( m.thead, m.tdata );
        v.renderTable();

        this.filter();
        this.pages();

        v.render( m.id );
        this.events();
    },

    init : function(obj, me) {
        var m = me.model,
            d = me.data,
            v = me.view;

        this.me = me;

        m.init(obj);

        d.setParam(m.url);
        d.get(this.setData, this);
    }    
};


tl.view = {

    me : {},

    thead : "",
    tdata : "",
    table : "",
    filter : "",
    pages : "",

    renderThead : function(thead){
        var html = '<tr>';

        for (var i = 0, m = thead.length; i < m; i++) {
            var cls = (thead[i].cls != undefined) ? thead[i].cls : '';
            html += '<th class="' + cls + '"><span data-title="' + thead[i].title + '">' + thead[i].label + '</span></th>';
        }
        html += '</tr>';

        this.thead = html;
    },

    renderItem : function(item, type){

        if (type === 'link') {
            item = '<a href="#">' + item + '</a>';
        } 
        else if (type === 'btn-circle') {
            var circle = '';
            for (var i = 0, m = item.length; i < m; i++) {
                circle += '<span class="btn-circle btn-circle-color-' + i + '">' + item[i] + "</span>";
            }
            item = circle;
        }

        return item;
    },

    renderTbody : function(thead, tdata){

        var html = '';

        for (var i = 0, m = tdata.length; i < m; i++) {
            html += '<tr>';

            for (var j = 0, n = tdata[i].length; j < n; j ++) {
                var item = tdata[i][j], 
                    type = thead[j].type;
                html += '<td>' + this.renderItem(item, type) + '</td>';
            }
            html += '</tr>';
        }

        this.tdata = html;
    },

    renderFilter : function(obj) {

    },

    renderPages : function(obj, replace, id) {
        var tpl = '<div class="pagination">' +
                      '<ul>' +
                          '{pages}'
                      '</ul>' +
                  '</div>';

        var pages = "",
            firstPage  = obj.firstPage,
            currPage   = obj.currPage,
            lastPage   = obj.lastPage,
            pagePeriod = obj.pagePeriod;

        var cls = (currPage == 1) ? 'disabled' : '';
        pages += '<li class="' + cls + '"><a href="#">&#8592; Ctrl</a></li>';

        for (var i = firstPage, m = firstPage + pagePeriod - 1; i <= m; i++) {
            cls = (i == currPage) ? 'active' : '';
            pages += '<li class="' + cls + '"><a href="#">' + i + '</a></li>';
        }

        if (obj.gap) {
            pages += '<li class="disabled"><a href="#">...</a></li>';
        }
        
        cls = (lastPage == currPage) ? 'active' : '';
        pages += '<li class="' + cls + '"><a href="#">' + lastPage + '</a></li>';

        cls = (lastPage == currPage) ? 'disabled' : '';
        pages += '<li class="' + cls + '"><a href="#">Ctrl &#8594;</a></li>';

        tpl = tpl.replace('{pages}', pages);

        this.pages = tpl;

        if (replace) {
            $('#' + id + ' .pagination').replaceWith(this.pages);
        }
    },

    renderTable : function() {
        var tpl = '<table class="table table-hovered table-fixed-header table-tablerone">' +
                    '<thead class="header">' +
                        '{theadRows}' +
                    '</thead>' +
                    '<tbody>' +
                        '{tbodyRows}' +
                    '</tbody>' +
                  '</table>';

        tpl = tpl.replace('{theadRows}', this.thead);
        tpl = tpl.replace('{tbodyRows}', this.tdata);

        this.table = tpl;
    },

    /* 
     * Based on https://github.com/oma/table-fixed-header
     *
     */

    freezeHeader : function(id) {

        var config = { topOffset : 0 },
            o = $('.table-fixed-header'),
            $win = $(window), 
            $head = $('thead.header', o),
            isFixed = 0;

        var headTop = $head.length && $head.offset().top - config.topOffset;

        function processScroll() {
            if (!o.is(':visible')) return;

            if ($('thead.header-copy').size()) {
                var i, scrollTop = $win.scrollTop();
                var t = $head.length && $head.offset().top - config.topOffset;

                if (!isFixed && headTop != t) { headTop = t; }
                
                if (scrollTop >= headTop && !isFixed) {
                    isFixed = 1;
                } else if (scrollTop <= headTop && isFixed) {
                    isFixed = 0;
                }
                isFixed ? $('thead.header-copy', o).removeClass('hide')
                        : $('thead.header-copy', o).addClass('hide');
            }
          }

          $win.on('scroll', processScroll);

          $head.on('click', function () {
            if (!isFixed) setTimeout(function () {  $win.scrollTop($win.scrollTop() - 47) }, 10);
          })

          $head.clone().removeClass('header').addClass('header-copy header-fixed').appendTo(o);

          var header_width = $head.width();

          o.find('thead.header-copy').width(header_width);

          o.find('thead.header > tr:first > th').each(function (i, h){
            var w = $(h).width();
            o.find('thead.header-copy> tr > th:eq('+i+')').width(w)
          });

          $head.css({ margin:'0 auto',
                      width: o.width(),
                     'background-color':config.bgColor });

          processScroll();
    },

    render : function(id)
    {
        $("#" + id).html(this.filter + this.table + this.pages);
        // $('.table-fixed-header').fixedHeader();
        this.freezeHeader();
    },

    setSortOrder : function(order, el, id) {
        var cls = (order == 'asc') ? 'order-asc' : 'order-desc',
            txt = $(el).html();

        $('#' + id + ' thead span').removeClass("order-asc").removeClass("order-desc");
        $('#' + id + ' .header-copy').removeClass("order-asc").removeClass("order-desc");

        $( '#' + id + ' thead span:contains(' + txt + ')' ).addClass(cls);
        $( '#' + id + ' .header-copy span:contains(' + txt + ')' ).addClass(cls);
    }
};

function tablerone(obj) {
    this.model = new tl.model();

    this.data = tl.data;
    this.util = tl.util;
    this.router = tl.router;
    this.view = tl.view;

    this.router.init(obj, this);
}
