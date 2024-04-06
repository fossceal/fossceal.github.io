HVHAuth = new auth("ad9sza4lsl1Idh6sosfreDr7ryyakocvg6H62pd7o51il850")
var superModal = document.getElementById("superModal");
hideModal = function(){

    superModal.style.display = "none";
}
showModal = function(){
    superModal.style.display = "block";
}

async function user(){
    let data = await this.HVHAuth.getUser()
    return data
}

var mu;
window.onload = async function(){
     mu = await user()
    if(mu == null){
        location.href="auth/"
    }else{
        document.getElementById("user").innerHTML = mu.username
    }
}

dial = new DialogMaster('masterDialog');
dial.setDialog('Are you sure you want to sign out?',kick,()=>{dial.hide()},true,true)

function signout(){
    dial.show()
}

function kick(){
    localStorage.removeItem('auth');
    location.reload()
}

var context = {}
document.getElementById("assin").addEventListener("click",()=>{
    var temp = `
    <div class="ACTION inactive" style="PAAA" onclick="toggleAction(this,'light')">
    <span class="material-symbols-outlined">
        lightbulb
        </span>

        <p>Light</p>
</div>`

var ttm = `
<div class="ACTION inactive" style="PAAA" onclick="toggleAction(this,'message')">
<span class="material-symbols-outlined">
    lightbulb
    </span>
<input id="message" type="text" value="HELLO WORLD"></input>

</div>`

    action=document.getElementById("action").value
    if(action == "light"){
    temp.replace("light",action);
    var st =context.elem.getAttribute("style")
    temp.replace("PAAA",st)
    context.elem.remove();
    hideModal()
    document.getElementById("console").innerHTML += temp
    }else{
        ttm.replace("message",action);
        var st =context.elem.getAttribute("style")
        ttm.replace("PAAA",st)
        context.elem.remove();
        hideModal()
        document.getElementById("console").innerHTML += ttm
    
    }


})

document.getElementById("neinasin").addEventListener("click",()=>{
    // do something

    hideModal()
})




acts = document.getElementsByClassName("ACTION")

const ledOnEndpoint = 'https://esp.govindsr.me/ledoff';
const ledOffEndpoint = 'https://esp.govindsr.me/ledon';


async function toggleAction(elem,action){
    if(elem.classList.contains("active")){
        elem.classList.remove("active")
        elem.classList.add("inactive")
        if(action == "light"){
         await axios.get(ledOffEndpoint)
        }else{
            msg = document.getElementById("message").value
            await axios.get(`https://esp.govindsr.me/handle_msg?message=${msg}`)
        }
    }else{
        elem.classList.remove("inactive")
        elem.classList.add("active")
        console.log(action, "is now active")
        if(action == "light"){
           await axios.get(ledOnEndpoint)
        }
        else{
            msg = '';
            await axios.get(`https://esp.govindsr.me/handle_msg?message=${msg}`)
        }
    }
}


function addAction(elem){
    context.elem = elem;
    showModal();
}