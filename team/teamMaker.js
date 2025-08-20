function elem(id) {
  return document.getElementById(id);
}
async function fetchandretjson(){
    return await fetch("/team/teamInfo.json")
    .then((response) => response.json())
    .then((data) => {
        return data;
    });
}
// "gif":"https://media1.tenor.com/m/L02ZQTZTI3IAAAAC/namaste-tamannaah.gif"

function generate(aqute,gif,name,role,pic,row,col,i){
    
    return `
                <div id="${aqute}" class="teamBOXXX">
                <div class="teamName">${name}</div>
                <div class="teamRole">${role}</div>
                <img src="/teamPics/${pic}.webp" class="teamPic">
                <div class="shadow"></div>
                <div class="gifcase" style="background: url('/teamGifs/${gif}');background-position: center;background-size: cover;"></div>
            </div>
            `
}


async function main(){
    let data = await fetchandretjson();
    let team = elem("teamCont");
    for (let i = 0; i < data.length; i++) {
        col = (i%5)+1;
        row = Math.floor(i/5) +1;
        team.innerHTML += generate(data[i].aqute,data[i].gif,data[i].name,data[i].role,data[i].pic,row,col,i);
    }

}

main()
function test(){
    for(i=0;i<20;i++){
        col = (i%5)+1;
        
        row = Math.floor(i/5) +1;
        console.log(row,col);
    }
}