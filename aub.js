/**
 * AdopteUnBot
 * @version 1.0
 * @author: Nicolas (@neodern) Jamet <neodern@gmail.com>
 * @about: Visitez automatiquement des profils et gagnez de la popularité sur AdopteUnMec.
 */


var aubBackground = $('<div>', {id:"aubBackground"});
var aubInit = $('<h2>', {id:"aub"}).text(chrome.i18n.getMessage('initAUB'));
var image = chrome.extension.getURL("medias/images/green-icon.png");
var visited = $("<img>", {class: "visited", src: image});

/**
 *
 * @param personClass
 */
function goToProfil(personClass) {

    $('.'+personClass).each($).wait(5000, function(){
        var $this = $(this);
        var $aub = $('#aub');
        if (!$this.hasClass('home-feed'))
        {
            var url = $this.find('a').first().attr('href');
            var name = $this.find('h4').text();
            var favicon = $this.find('.favicon').html();
            if (url && url != '' && favicon != '')
            {
                $.get(url, function(){
                    if ($aub.text().indexOf('Veuillez') !== -1)
                        $aub.html('Adopte un Bot a visité le profil de <a id="aubLink" href="'+url+'">'+name+'</a>.');
                    else
                    {
                        var $aubLink = $('#aubLink');
                        $aubLink.attr('href', url);
                        $aubLink.text(name);
                    }
                    $this.find('.pic').append(visited);
                });
            }
            else
            {
                if ($aub.length === 0)
                    $('#area-products').after(aubBackground.append(aubInit));
                else
                    $aub.text("Veuillez patienter...");
            }
        }
    });
}

/**
 *
 */
function buttonAubEvent() {

    var botMembers = [];
    var recursiveSearch = function(page) {
        var $aub = $('#aub');
        $.ajax({
            type:'GET',
            url: 'http://www.adopteunmec.com/mySearch/ajax_loadPages',
            data: {
                page: page
            },
            dataType: 'json',
            success: function(response) {
                if (response.members.length === 0)
                {
                    visitAllSearchProfiles(botMembers);
                    return;
                }
                botMembers = botMembers.concat(response.members);
                $.wait(1000, function() {
                    if (page === 1)
                        $aub.text(chrome.i18n.getMessage('getSearchPages'));
                    else
                        $aub.text($aub.text() + '.');
                    recursiveSearch(++page);
                });
            }
        });
    };

    var visitAllSearchProfiles = function(botMembers) {
        var i = 0;
        var l = botMembers.length;
        var $aub = $('#aub');
        var profil = setInterval(function(){
            if (i < l)
            {
                $.ajax({
                    type: 'GET',
                    url: 'http://www.adopteunmec.com' + botMembers[i].url,
                    success: function() {
                        if (typeof botMembers[i].thumb == 'undefined')
                            botMembers[i].thumb = 'http://s.adopteunmec.com/fr/www/img/thumb2.jpg?0abd11afc5d29d244672a79b0ba7bc3e';
                        $aub.html(
                            '<p style="margin-top:10px;">Adopte un Bot a visité le profil de</p>' +
                            '<div class="person" style="width:66px;" data-id="15281598">' +
                                '<a href="' + botMembers[i].url +'">' +
                                    '<div>' +
                                        '<img style="margin-left:1px;" src="'+ botMembers[i].thumb +'" alt="'+ botMembers[i].pseudo +'" width="64" height="64">' +
                                    '</div>' +
                                    '<h4>'+ botMembers[i].pseudo +'</h4>' +
                                '</a>' +
                            '</div><br /><br />' +
                            '<a style="margin:0 auto;width:60px;font-size: 11px;color:white;" href="http://www.adopteunmec.com/">Quitter <span style="color:#fc8bb1;">AuB</span> :(</a>'
                        );
                    }
                });
                ++i;
            }
            else
            {
                clearInterval(profil);
                $aub.html(
                    '<p>Tous les profils ont été visité !</p>'+
                    '<a style="margin:0 auto;width:60px;font-size: 11px;color:white;" href="http://www.adopteunmec.com/">Quitter <span style="color:#fc8bb1;">AuB</span> :(</a>'
                );
            }
        }, 8000);
    };

    $('#aubSearchRun').click(function(){

        $('#area-products').after("<div style='margin-top:10px;background-color:#191919;'><img style='margin-top:-2px;' src='" + chrome.extension.getURL("search_top.png") + "'/><h2 id='aub' style='margin-top:10px;text-align:center;border:none;font-family: Novecento Narrow Demibold;color:white;font-size:14px;padding:5px 0'>" + chrome.i18n.getMessage('initAUB') + "</h2><img style='margin-left:-1px;' width='851px' src='" + chrome.extension.getURL("search_bot.png") + "'/></div>");
        recursiveSearch(1);
    });

    $('#aubRun').click(function(){
        $('#aubRun').html("<span class='left'><span class='content'><span class='picto'></span>Lancement d'AuB...</span></span>");
        window.location = "http://www.adopteunmec.com/index";
    });
}

    if (document.URL.indexOf('http://www.adopteunmec.com/mySearch') !== -1)
    {
        $('.nav-pager.top').prepend('<a id="aubSearchRun" class="action modify-search"><span class="left"><span class="content"><span>Adopte Un Bot</span></span></span></a>');
    }
    else if (document.URL == 'http://www.adopteunmec.com/')
    {
        $('#area-products').after(
            '<a style="margin-top:10px" class="btn small-radius charm" id="aubRun"><span class="left"><span class="content"><span class="picto"></span>Adopte un Bot</span></span></a>' +
            '<a style="margin-top:10px" class="btn small-radius charm" id="aubSearchRun"><span class="left"><span class="content"><span class="picto"></span>Adopte un Bot - Search</span></span></a>'
        );
    }
    else if (document.URL == 'http://www.adopteunmec.com/index')
    {
        $('#area-products').wait(5000, function(){
            $(this).after(
                '<a style="float:right;margin-top:-35px;margin-right:10px;font-size: 11px;color:white;" href="http://www.adopteunmec.com/">Quitter <span style="color:#fc8bb1;">AuB</span> :(</a>'
            );
        });
        goToProfil('person');
        $.wait(1000000, function(){
            location.reload();
        });
    }
    buttonAubEvent();
