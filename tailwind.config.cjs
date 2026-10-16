module.exports = {
      content: ["./index.html", "./app.js"],
      theme: { extend: {
        fontFamily: { sans: ['"Noto Sans KR"','system-ui','sans-serif'] },
        animation: {
          'float':'float 6s ease-in-out infinite',
          'slide-up':'slideUp .5s cubic-bezier(.22,1,.36,1) forwards',
          'pop':'pop .45s cubic-bezier(.22,1,.36,1) forwards',
          'fade-in':'fadeIn .35s ease forwards',
          'shake':'shake .4s ease',
        },
        keyframes: {
          float:   { '0%,100%':{ transform:'translateY(0)' }, '50%':{ transform:'translateY(-14px)' } },
          slideUp: { from:{ transform:'translateY(28px)', opacity:0 }, to:{ transform:'translateY(0)', opacity:1 } },
          pop:     { '0%':{ transform:'scale(.75)', opacity:0 },'60%':{ transform:'scale(1.06)' },'100%':{ transform:'scale(1)', opacity:1 } },
          fadeIn:  { from:{ opacity:0 }, to:{ opacity:1 } },
          shake:   { '0%,100%':{ transform:'translateX(0)' },'25%':{ transform:'translateX(-6px)' },'75%':{ transform:'translateX(6px)' } },
        },
      }},
    };
