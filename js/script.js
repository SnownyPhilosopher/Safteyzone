// ==========================
// AOS INITIALIZATION
// ==========================

AOS.init({

    duration:1000,
    once:true,
    offset:100

});


// ==========================
// NAVBAR SCROLL EFFECT
// ==========================

const navbar = document.querySelector(".navbar");

window.addEventListener("scroll",()=>{

    if(window.scrollY > 100){

        navbar.classList.add("scrolled");

    }
    else{

        navbar.classList.remove("scrolled");

    }

});


// ==========================
// COUNTER ANIMATION
// ==========================

const counters = document.querySelectorAll(".counter");

const runCounter = (counter)=>{

    const target = Number(counter.dataset.target);
    let count = 0;
    const speed = target / 80;

    const update = ()=>{

        count += speed;

        if(count < target){

            counter.innerText = Math.ceil(count);
            requestAnimationFrame(update);

        }
        else{

            counter.innerText = target + "+";

        }

    };

    update();

};

const counterObserver = new IntersectionObserver((entries)=>{

    entries.forEach(entry=>{

        if(entry.isIntersecting){

            runCounter(entry.target);
            counterObserver.unobserve(entry.target);

        }

    });

},{

    threshold:.5

});

counters.forEach(counter=>{

    counterObserver.observe(counter);

});


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
// APPLY BRACKET SIGNATURE TO CARDS
// ==========================

const bracketTargets = document.querySelectorAll(
    ".service-item, .location-item, .testimonial-item, .stat-item, .client-logo"
);

bracketTargets.forEach(el=>{

    el.classList.add("brackets");

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
