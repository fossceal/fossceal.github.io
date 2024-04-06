HVHAuth = new auth("ad9sza4lsl1Idh6sosfreDr7ryyakocvg6H62pd7o51il850")

async function login(){
    let data = await this.HVHAuth.requestKey()
    return data
}

async function loginUrl(){
    let data = await this.HVHAuth.requestLoginURL()
    return data;
}


async function proceed(){
    let mu = await login()
    if(mu.status == "success"){
        var uri = await loginUrl();
        location.href = uri.url;
    }
}
proceed()