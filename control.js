function var_set(type, value) {
    var r = document.querySelector(':root');
    r.style.setProperty(type, value);
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function heroBG() {
    const time = 2000;
    for (let i = 1; i < 9; i++) {
        var_set('--HeroBG', 'url(./pics/'+i+'.jpg)');
        await sleep(time);
    }
    await sleep(time);
}
heroBG()
setInterval(heroBG,16000 );