
/**
 * 静态页面依赖样式
 */

import './css/staticCss4.scss';

/**
 * 浏览器和语法兼容
 */
import "babel-polyfill";

class PageController { 

  constructor() {

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
  }
}

window.pgc = new PageController();
window.pgc.build();


