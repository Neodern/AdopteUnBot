/**
 * AdopteUnBot
 * @version 1.0
 * @author: Nicolas (@neodern) Jamet <neodern@gmail.com>
 * @about: Visitez automatiquement des profils et gagnez de la popularité sur AdopteUnMec.
 */

/*
 * todo : Add an icon / text for "Fork me on GitHub"
 */

/**
 *
 * @param personClass
 */
function goToProfil(personClass) {
    var image = chrome.extension.getURL("medias/images/green-icon.png");

    $('.'+personClass).each($).wait(5000, function(){
        // Todo : Gérer cette section (Home) avec l'âge de la personne.
        var $this = $(this),
            $aub = $('#aub');

        if (!$this.hasClass('home-feed'))
        {
            var id = $this.attr("data-id");
            var url = $this.find('a').first().attr('href');
            var name = $this.find('h4').text();
            var favicon = $this.find('.favicon').html();
            if (url && url != '' && favicon != '')
            {
                $.get(url, function(){
                    $aub.html('Adopte un Bot a visité le profil de <a id="aubLink" target="_blank" href="'+url+'">'+name+'</a>.');
                    $this.find('.pic').append('<img class="visitedDot" width="9px" src="'+image+'"/>');
                });
            }
            else
            {
                if ($aub.length === 0)
                    $('#sectionAuB').html("<span id='aub'>" + chrome.i18n.getMessage('initAUB') + "</span>");
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
        var i = 0,
            l = botMembers.length,
            $aub = $('#aub');

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
                            'Adopte un Bot a visité le profil de <a id="aubLink" target="_blank" href="'+botMembers[i].url+'">'+botMembers[i].pseudo+'</a>.'
                        );
                    }
                });
                ++i;
            }
            else
            {
                clearInterval(profil);
                $aub.html(chrome.i18n.getMessage('AllProfilesVisited'));
            }
        }, 8000);
    };

    var navbarAuB =
        '<nav id="navbarAuB" class="navbar">' +
            '<ul class="overview">' +
                '<li id="basket"><a target="_blank" href="https://github.com/Neodern/AdopteUnBot"><span id="logoAuB">Adopte un <span>Bot</span></span></a></li>' +
            '</ul>' +
            '<section id="sectionAuB">' +
                '<ul class="shortcuts columns-2">' +
                    '<li id="search"><a id="aubRun">Lancer AuB</a></li>' +
                    '<li id="my-page"><a id="aubSearchRun">Lancer AuB Search</a></li>' +
                '</ul>' +
            '</section>' +
            '<section id="leaveAuB"></section>' +
        '</nav>';

    var leaveAuB = '<ul class="overview"><li><a class="leaveAuB">Quitter <span>AuB</span> :(</a></li></ul>';

$(document).ready(function() {

    var status = localStorage.getItem("AuB");
    console.log(status);
    if (document.URL !== "http://www.adopteunmec.com/home")
        return;

    $('#area-products').wait(3000, function() {
        $("#area-products").after(navbarAuB);
    });

    switch (status)
    {
        case "Search":
            $('#sectionAuB').html("<span id='aub'>" + chrome.i18n.getMessage('initAUB') + "</span>");
            $("#leaveAuB").html(leaveAuB);

            recursiveSearch(1);

            break;
        case "Home":
            $('#sectionAuB').html("<span id='aub'>" + chrome.i18n.getMessage('initAUB') + "</span>");
            $("#leaveAuB").html(leaveAuB);

            goToProfil('person');
            $.wait(1000000, function(){ location.reload(); });

            break;
        case null:

            break;
        default:

            break;
    }

    $(document).on('click', '#aubSearchRun', function(){
        localStorage.setItem("AuB", "Search");
        $('#sectionAuB').html("<span id='aub'>" + chrome.i18n.getMessage('initAUB') + "</span>");
        $("#leaveAuB").html(leaveAuB);
        recursiveSearch(1);
    });

    $(document).on('click', '#aubRun', function() {
        localStorage.setItem("AuB", "Home");
        $('#sectionAuB').html("<span id='aub'>" + chrome.i18n.getMessage('initAUB') + "</span>");
        $("#leaveAuB").html(leaveAuB);

        goToProfil('person');
        $.wait(1000000, function(){ location.reload(); });

    });

    $(document).on('click', '.leaveAuB', function() {
        localStorage.removeItem("AuB");
        location.reload();
    });
});
