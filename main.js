let player = {
    rolls: 0,
    roll_speed: 1,
    rng: 0,
    best_rng: 0,
    lucks: [
        [0, 'Basic'],
        [5, 'Rare'],
        [25, 'Decent'],
        [125, 'Unique'],
        [625, 'Magic'],
        [3125, 'Incredible'],
        [15625, 'Auspicious'],
        [78125, 'Egregious'],
        [4e5, 'Legendary'],
        [2e6, 'Outrageous'],
        [2.5e7, 'Minatory'],
        [4e8, 'Ethereal'],
        [1.5e10, 'Sagacious']
    ],
    isRolling: false,
    auto_save_interval: 10
}

function save()
{
    let data = {rolls: player.rolls, best_rng: player.best_rng};
    localStorage.setItem('Roller', btoa(JSON.stringify(data)))
}

function load()
{
    let data = localStorage.getItem('Roller');
    if (data)
    {
        data = JSON.parse(atob(data));
        player.rolls = data.rolls;
        player.best_rng = data.best_rng;
    }
}

function updateRollSpeed()
{
    setValue('roll_speed',
        (1 + Math.log10(player.best_rng + 1) / 80)
         * (1 + Math.log10(player.rolls / 1e2 + 1) / 10));
}

function updateInfoText()
{
    $('#multi-info').html(`<span style="font-size: 200%;">Roller</span><br><span style="font-size: 50%;">
        You have rolled your luck ${format(player.rolls)} times<br>
        And your best RNG is ${format(player.best_rng)}.<br>
        This speeds up your rolls by ${format(player.roll_speed, 4)}</span>`)
}

function setValue(name, value)
{
    player[name] = value;
    if (name === "rolls" || name === "best_rng")
    {
        updateRollSpeed();
        updateInfoText();
    }
}

function getTierRNG(rng)
{
    let tier = 0;
    for (let i = 0; i < player.lucks.length; i+=1)
    {
        if (i < player.lucks.length)
        {
            if (rng >= player.lucks[i][0]) tier++;
            else break;
        }
        else break;
    }
    return tier;
}

function createLuckString(rng)
{
    let tier = getTierRNG(rng);
    return `
    <div class='luck luck-${tier}'>
        <p class='luck-text luck-${tier}-text'>${player.lucks[tier - 1][1]}<br><span class="luck-text luck-${tier}-text" style="font-size: 75%;">${format(rng)} RNG</span></p>
    </div>`;
}

function createLuck(rng)
{
    return $(createLuckString(rng));
}

function getRNG()
{
    return (1 / Math.random()) ** 1.75;
}

function roll()
{
    if (!player.isRolling)
    {
    player.isRolling = true;
    setValue('rolls', player.rolls + 1)
    let RNG;
    for (let i = 0; i < 80; i += 1)
    {
        const rng = getRNG(),
              tier = getTierRNG(rng);
        if (i === 75)
        {
            RNG = rng;
        }
        $($('#luck-container .luck')[i]).removeClass().addClass(`luck luck-${tier}`).attr('class');
        $($('#luck-container .luck')[i]).children('p').removeClass().addClass(`luck-text luck-${tier}-text`).html(
            `${player.lucks[tier - 1][1]}<br><span class="luck-text luck-${tier}-text" style="font-size: 75%;">${format(rng)} RNG</span>`);
    }
    $('#frame').css('opacity', '0');
    $('#frame').show();
    $('#frame').animate({opacity: 1}, 500 / player.roll_speed);
    $('#luck-container').css('opacity', '0');
    $('#luck-container').show();
    $('#luck-container').animate({opacity: 1}, 500 / player.roll_speed,
    function()
    {
    
    let distance = $('#luck')[0].getBoundingClientRect().left - $('#luck-container-line')[0].getBoundingClientRect().left + $('#luck')[0].getBoundingClientRect().width / 2;
    $('#luck-container').animate({scrollLeft: distance}, 3000 / player.roll_speed, 'swing', 
        function()
        {
            setValue('rng', RNG);
            if (player.best_rng < RNG) setValue('best_rng', RNG);
            $('#luck-container-line').animate({opacity: '0'}, 250 / player.roll_speed);
            $('#luck-container .luck:not(#luck)').animate({'opacity': '0'}, 250 / player.roll_speed
                , $('#luck-container .luck:not(#luck)').hide)
            setTimeout(function()
                       {   
                           $('#frame').animate({opacity: 0}, 200 / player.roll_speed, function(){$('#frame').hide()})
                           $('#luck-container').animate({'opacity': '0'}, 200 / player.roll_speed, 
                               function()
                               {
                                   $('#luck-container').scrollLeft(0);
                                   $('#luck-container').hide();
                                   $('#luck-container').css('opacity', '1')
                                   $('#luck-container-line').css('opacity', '1')
                                   $('#luck-container .luck:not(#luck)').css('opacity', '1')
                                   $('#luck-container .luck:not(#luck)').show()
                                   
                                   player.isRolling = false;
                               });
            }, 1000 / player.roll_speed)
        })
    })
    }
}

$(document).ready(function() {
    load();
    for (let i = 0; i < 80; i+=1)
    {
        let luck = createLuck(0)
        if (i === 75) luck.attr('id', 'luck');
        $('#luck-container').append(luck);
    }
    $('#luck-container').hide();
    $('#frame').hide();
    $('#roll').on('click', roll);
    updateRollSpeed();
    updateInfoText();
    
    setInterval(function()
    {
        save();
    }, player.auto_save_interval * 1e3)
})

function format(num, acc = 2, integer = false)
{
    const formats = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc'
                       , 'No', 'Dc', 'Ud', 'Dd', 'Td', 'Qua'],
          log = num >= 1 ? Math.floor(Math.log10(num) / 3) : 0;
    num = num / 1e3 ** log;
    num = Math.floor(num * 10 ** acc) / 10 ** acc;
    return num < 1e3 ** formats.length ? num + formats[log]
                    : num.toExponential(acc);
      }
