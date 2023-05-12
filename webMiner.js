function mineWebsite(doDownload=false){

    if (doDownload == true){
         downloadAnchor = document.createElement('a');
         document.body.appendChild(downloadAnchor);
    }

    function download(path,fileName){
        downloadAnchor.href = path;
        downloadAnchor.download = fileName;
        downloadAnchor.click();
    }

    function isCraftable(item){
        var toolImg = item.querySelector('td.tool img');
        return toolImg ? (toolImg.alt ==  'Établi<br>') : false;
    }
    
    function getName(item){
        var img = item.querySelector('.col-nom img');
        return getCleanAlt(img);
    }

    function getCleanAlt(img){
        var alt = img.alt.split('<br>')[0];
        alt = alt.split('</span>')[0];
        alt = alt.split('>');
        return alt.length == 1 ? alt[0] : alt[1];
    }

    function simplify(name){
        return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }
    
    function getRecipe(item){
        var crafting = item.querySelector("td.crafting");
        crafting = [...crafting.querySelectorAll("div.casecraft")];
        crafting = crafting.map(div => div.querySelector("span.grid-input"));
        
        function getInput(span){
            var img = span.querySelector("img");
            if (img != null){
                if (! ingredients.includes(img))ingredients.push(img);
                return getCleanAlt(img);
            }
            else return null;
        }
    
        return crafting.map(span => getInput(span));
    }

    function getImg(item){
        var img = item.querySelector('.grid-output img');
        return convertImg(img);
    }

    function convertImg(img){
        if (img.src == 'https://fr-minecraft.net/css/img/pixel.png'){
            var classes = [...img.classList];
            if (classes.includes("img-item-small"))
            return {"type":"specialItem1","position":img.style.backgroundPosition};
            else if (classes.includes("img2-item-small"))
            return {"type":"specialItem2","position":img.style.backgroundPosition};
            else if (classes.includes("img-bloc-small") || classes.includes("img2-bloc-small"))
            return {"type":"specialBloc","position":img.style.backgroundPosition};
        }
        else {
            var fileName = simplify(getCleanAlt(img));
            if (doDownload == true){
                download(img.src,fileName);
            }
            var extension = "";
            var src = img.src;
            var len = src.length;
            for (var i = 3; i>0; i--) extension += src[len-i];
            return {"type":"bloc","src":`./img/bloc/${fileName}.${extension}`};
        }
    }

    function isAllowed(itemName){
        return ! forbiddenItems.includes(itemName);
    }

    //main
    
    var forbiddenItems = ["Sac","Dalle en chêne pétrifiée","Lit"];

    var dictionary = {};
    var ingredients = [];

    var items = [...document.querySelectorAll('tr.tr')];
    for (var item of items){
        var name = getName(item);
        if (isAllowed(name) && isCraftable(item) && ! dictionary[simplify(name)]){
            dictionary[simplify(name)] = {"name":name,"recipe":getRecipe(item),"img":getImg(item)}; 
        }
    }
    for (item of ingredients){
        var name = getCleanAlt(item);
        if (isAllowed(name) && ! dictionary[simplify(name)]){
            dictionary[simplify(name)] = {img:convertImg(item)};
        }
    }

    if (doDownload==true) document.body.removeChild(downloadAnchor);

    var result = [dictionary,JSON.stringify(dictionary)];
    console.log(result[0]);
    console.log(result[1]);
    return result;

};

