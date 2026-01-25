window.addEventListener('DOMContentLoaded', () => {

function observer(element){
    const observer=new IntersectionObserver((entries)=>{
        entries.forEach((entry)=>{
            if(entry.isIntersecting){
                entry.target.classList.add('visible');
            }
        });
    },{threshold:0.2})
    observer.observe(document.querySelector(element));
};
observer('#content');

function typewriterAffect(){
    const navText=document.getElementById('navText');
    const message='Use navigate links to explore site';

    navText.classList.remove('hidden');
    let index=0
    if(index<message.length){
    setInterval(()=>{
            navText.innerHTML+=message.charAt(index);
            index++
    },100)
    }else{return}
}

function smoothAppearance(){
    const welcomeText=document.getElementById('welcomeText');
    const discText=document.getElementById('discText');
    const appaintment=document.getElementById('appointment');

    welcomeText.classList.add('visible');
    
    setTimeout(()=>{
        welcomeText.style.transform=`translateY(${0}px)`
        welcomeText.classList.remove('visible');
        
        setTimeout(()=>{
            discText.classList.remove('hidden')
            discText.classList.add('visible')
            setTimeout(()=>{
                typewriterAffect();
                appaintment.classList.add('visible')
            },500)
        },1000)
    },2000) 
}
smoothAppearance()


});