
/**
 * 静态页面依赖样式
 */

import './css/staticCss5.scss';

/**
 * 浏览器和语法兼容
 */
import "babel-polyfill";

class PageController { 

  constructor() {

  }

  init() {
    function onResize() {
      if (window.innerWidth <= 768) {
        //isMobile
        document.documentElement.style.fontSize = "2vmin";
      } else {
        document.documentElement.style.fontSize = "14px";
      }
    }
    window.addEventListener("resize", onResize);
    onResize();
  }

  initMenuEvnt() {

    let $menuItems = document.getElementsByClassName('nav-item');
    for(let i=0; i<$menuItems.length; i++) {

      const item = $menuItems[i]
      item.addEventListener('click', () => {
        
        for(let i=0; i<$menuItems.length; i++) {
          $menuItems[i].classList.remove('active');
        }
        item.classList.add('active');
      })
    }
  }

  build() {
    this.initMenuEvnt();
    this.init();
  }
}

window.pgc = new PageController();
window.pgc.build();


