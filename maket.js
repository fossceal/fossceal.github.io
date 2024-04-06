var components = document.getElementsByClassName("componentList")[0].children;
const bodyRect = document.body.getBoundingClientRect();

function geneePlaceBlocks(){
    var tem = `
        <div class="placeBLXK" id="GRID%%" style="grid-row:#f/@#;grid-column:#%/6&" p="#f" q="@#" r="#%" s="6&">
       
        </div>
        `
        var row = 1
        for(var i=1;i<=100;i++){

            var ree = i%10;
            if(ree == 0){
                ree = 10;
            }
            // console.log(ree)
            var temp = tem.replace("%%",i);
            temp = temp.replace(/#f/g,row);
            temp = temp.replace(/@#/g,row+1);
            temp = temp.replace(/#%/g,ree);
            temp = temp.replace(/6&/g,ree+1);
            // temp = temp.replace("THEMPI_PP",i);
            document.getElementsByClassName("screen")[0].innerHTML+=temp;
            if(ree==10){
                row+=1;
            }
        }
}


var componentRegistry = {

}
var context={
    currentComponent: null
}
function untoggleAll(){
    for (let i = 0; i < components.length; i++) {
        components[i].classList.remove("toggled");
        componentRegistry[components[i].id].status = "unselected";
    }
}

for (let i = 0; i < components.length; i++) {
    componentRegistry[components[i].id] = {
        elem: components[i],
        status: "unselected"
    }
    components[i].addEventListener("click",()=>{
        
        if(componentRegistry[components[i].id].status == "unselected"){
            untoggleAll()
        components[i].classList.add("toggled");
        componentRegistry[components[i].id].status = "selected";
        context.currentComponent = componentRegistry[components[i].id];
        }else{
            untoggleAll()
            components[i].classList.remove("toggled");
            componentRegistry[components[i].id].status = "unselected";
            context.currentComponent = null;
        }

    })
}
geneePlaceBlocks()

var placeBm = []

for(var i=1;i<100;i++){
    placeBm.push(document.getElementById("GRID"+i))
}


function go(){
    placeBm.forEach((e)=>{
        if(e != undefined){
        id = e.id;
        
    document.getElementById(id).addEventListener("mouseenter",(e)=>{
        context.mouseOver = e.target
        if(context.currentComponent != null){
            if(context.currentComponent.elem.id == "genericToggle"){
                
                if( parseInt(e.target.id.replace("GRID",""))%10 == 0){
                    e.target.classList.add("hoverError")
                    var t = parseInt(e.target.id.replace("GRID",""))
                    context.placeAble = false

                }else{
                e.target.classList.add("hoverOk")
                
                var t = parseInt(e.target.id.replace("GRID",""))
                document.getElementById("GRID"+(t+1)).classList.add("hoverOk")
                context.placeAble = true
                // document.getElementById("GRID"+(t+2)).classList.add("hoverOk")
                }
        

            }else if(context.currentComponent.elem.id == "genericScale"){
                if(parseInt(e.target.id.replace("GRID",""))%10 == 9 || parseInt(e.target.id.replace("GRID",""))%10 == 0){
                    e.target.classList.add("hoverError")
                    var t = parseInt(e.target.id.replace("GRID",""))
                    if(t%10 == 9){
                        document.getElementById("GRID"+(t+1)).classList.add("hoverError")
                    }
                }else{
                e.target.classList.add("hoverOk")
                var t = parseInt(e.target.id.replace("GRID",""))
                document.getElementById("GRID"+(t+1)).classList.add("hoverOk")
                document.getElementById("GRID"+(t+2)).classList.add("hoverOk")

                }
            }

            // console.log(context.currentComponent.elem.id+" is hovered on "+e.target.id)
        }
    })

    document.getElementById(id).addEventListener("mouseleave",(e)=>{
        context.mouseOver = null
        if(context.currentComponent != null){
            if(context.currentComponent.elem.id == "genericToggle"){
                
                
                if(parseInt(e.target.id.replace("GRID",""))%10== 0){
                    
                    e.target.classList.remove("hoverError")
                    var t = parseInt(e.target.id.replace("GRID",""))
                    // document.getElementById("GRID"+(t+1)).classList.remove("hoverError")
                    
                }else{
                e.target.classList.remove("hoverOk")
                var t = parseInt(e.target.id.replace("GRID",""))
                document.getElementById("GRID"+(t+1)).classList.remove("hoverOk")
                // document.getElementById("GRID"+(t+2)).classList.remove("hoverOk")
                }
            }else if(context.currentComponent.elem.id == "genericScale"){
                if(parseInt(e.target.id.replace("GRID",""))%10 == 9 || parseInt(e.target.id.replace("GRID",""))%10 == 0){
                    e.target.classList.remove("hoverError")
                    var t = parseInt(e.target.id.replace("GRID",""))
                    if(t%10 == 9){
                        document.getElementById("GRID"+(t+1)).classList.remove("hoverError")
                    }
                }else{
                e.target.classList.remove("hoverOk")
                var t = parseInt(e.target.id.replace("GRID",""))
                document.getElementById("GRID"+(t+1)).classList.remove("hoverOk")
                document.getElementById("GRID"+(t+2)).classList.remove("hoverOk")
                

                }
            }
        }
    })

    document.getElementById(id).addEventListener("click",(e)=>{
        if(context.currentComponent !=null){
            if(context.currentComponent.elem.id == "genericToggle"){
                if(context.mouseOver != null){
                    if(context.placeAble){
                        var tmp = `            <div id="rnd" class="majorToggle" style="grid-row:##/$$;grid-column:&&/**;">
                        <p id="labelForToggle">Label</p>
                        </div>`
                        var p = context.mouseOver.getAttribute("p")
                        var q = context.mouseOver.getAttribute("q")
                        var r = context.mouseOver.getAttribute("r")
                        var s = context.mouseOver.getAttribute("s")
                        
                        tmp = tmp.replace("rnd",context.mouseOver.id)
                        var row = parseInt(context.mouseOver.id.replace("GRID",""))
                        tmp = tmp.replace("##",p)
                        tmp = tmp.replace("$$",q)
                        var col = parseInt(context.mouseOver.id.replace("GRID",""))%10
                        tmp = tmp.replace("&&",r)
                        tmp = tmp.replace("**",parseInt(s)+1)
                        

                        document.getElementsByClassName("screen")[0].innerHTML+=tmp
                        var t = parseInt(context.mouseOver.id.replace("GRID",""))
                        
                        delete placeBm[placeBm.indexOf(document.getElementById("GRID"+t))]
                        delete placeBm[placeBm.indexOf(document.getElementById("GRID"+(t+1)))]

                        delete placeBm[t]
                        document.getElementById("GRID"+(t)).remove()
                        document.getElementById("GRID"+(t+1)).remove()
                        context.mouseOver = null
                        context.placeAble = false
                        go()
                    }
                }
            }
            // if()
        }
    });
    
}})

}



go();



