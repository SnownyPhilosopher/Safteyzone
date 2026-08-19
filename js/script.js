
// ==========================
// CLOSE MOBILE MENU AFTER CLICK
// ==========================

const navLinks = document.querySelectorAll(".nav-link");
const menu = document.querySelector("#navbarMenu");

navLinks.forEach(link=>{

    link.addEventListener("click",()=>{

        const collapse = bootstrap.Collapse.getInstance(menu);

        if(collapse){

            collapse.hide();

        }

    });

});



// ==========================
// IMAGE LOADING EFFECT
// ==========================

const images = document.querySelectorAll("img");

images.forEach(image=>{

    image.addEventListener("load",()=>{

        image.classList.add("loaded");

    });

});
