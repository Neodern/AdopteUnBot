/**
 * AdopteUnBot
 * @version 1.0
 * @author: Nicolas (@neodern) Jamet <neodern@gmail.com>
 * @about: Visitez automatiquement des profils et gagnez de la popularité sur AdopteUnMec.
 */


/**
 *
 * @param personClass
 */
function goToProfil(personClass) {
    var image = chrome.extension.getURL("medias/images/green-icon.png");

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
                    $this.find('.pic').append('<img width="9px" style="position:absolute;left:5px;bottom:2px" src="'+image+'"/>');
                });
            }
            else
            {
                if ($aub.length === 0)
                    $('#area-products').after("<div id='aubBackground'><h2 id='aub'>" + chrome.i18n.getMessage('initAUB') + "</h2></div>");
                else
                    $aub.text("Veuillez patienter...");
            }
        }
    });
}

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
                            '<a style="margin:0 auto;width:60px;font-size: 11px;color:white;" class="leaveAuB">Quitter <span style="color:#fc8bb1;">AuB</span> :(</a>'
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
                    '<a style="margin:0 auto;width:60px;font-size: 11px;color:white;" class="leaveAuB">Quitter <span style="color:#fc8bb1;">AuB</span> :(</a>'
                );
            }
        }, 8000);
    };


$(document).ready(function() {


    var status = localStorage.getItem("AuB");

    switch (status)
    {
        case "Search":
            $('.nav-pager.top').prepend('<a id="aubSearchRun" class="action modify-search"><span class="left"><span class="content"><span>Adopte Un Bot</span></span></span></a>');

            break;
        case "Home":
            $('#area-products').wait(5000, function(){
                $(this).after(
                    '<a style="float:right;margin-top:-35px;margin-right:10px;font-size: 11px;color:white;" class="leaveAuB">Quitter <span style="color:#fc8bb1;">AuB</span> :(</a>'
                );
            });
            goToProfil('person');
            $.wait(1000000, function(){
                location.reload();
            });

            break;
        case null:
            $('#area-products').after(
                '<nav id="navbarAuB" class="navbar">' +
                    '<ul class="overview">' +
                        '<li id="basket"><a href="https://github.com/Neodern/AdopteUnBot"><span id="logoAuB">Adopte un <span>Bot</span></span></a></li>' +
                    '</ul>' +
                    '<ul class="shortcuts columns-2">' +
                        '<li id="search"><a id="aubRun">Lancer AuB</a></li>' +
                        '<li id="my-page"><a id="aubSearchRun">Lancer AuB Search</a></li>' +
                    '</ul>'+
                '</nav>'
            );

            break;
        default:
            console.log(status);

            break;
    }

    $(document).on('click', '#aubSearchRun', function(){
        localStorage.setItem("AuB", "Search");
        $('#area-products').after("<div class='aubSearch' style='margin-top:10px;background-color:#191919;'><img style='margin-top:-2px;' src='" + chrome.extension.getURL("search_top.png") + "'/><h2 id='aub' style='margin-top:10px;text-align:center;border:none;font-family: Novecento Narrow Demibold;color:white;font-size:14px;padding:5px 0'>" + chrome.i18n.getMessage('initAUB') + "</h2><img style='margin-left:-1px;' width='851px' src='" + chrome.extension.getURL("search_bot.png") + "'/></div>");
        recursiveSearch(1);
    });

    $(document).on('click', '#aubRun', function() {
        localStorage.setItem("AuB", "Home");
        $('#aubRun').remove();
        $('#aubSearchRun').remove();

        $('#area-products').wait(5000, function(){
            $(this).after(
                '<a style="float:right;margin-top:-35px;margin-right:10px;font-size: 11px;color:white;" class="leaveAuB">Quitter <span style="color:#fc8bb1;">AuB</span> :(</a>'
            );
        });
        goToProfil('person');
        $.wait(1000000, function(){
            location.reload();
        });

    });

    $(document).on('click', '.leaveAuB', function(e) {
        localStorage.removeItem("AuB");
        location.reload();
    });

});
