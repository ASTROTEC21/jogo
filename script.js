var intervalo;
var contexto = document.getElementById("tela").getContext("2d");
var pontuacao = 0;
var elementoPontuacao = document.getElementById("pontuacao");
var telaIntro = document.getElementById("telaIntro");
var telaGameOver = document.getElementById("telaGameOver");
var mensagemGameOver = document.getElementById("mensagemGameOver");
var telaVitoria = document.getElementById("telaVitoria");
var mensagemVitoria = document.getElementById("mensagemVitoria");
var telaPausa = document.getElementById("telaPausa");
var botaoPausar = document.getElementById("botaoPausar");
var jogoEmAndamento = false;
var jogoPausado = false;

var esquerdaPressionada = false;
var direitaPressionada = false;

function ObjetoJogo(x, y, img) {
  this.x = x; this.y = y; this.img = img; this.ativo = true;
}
ObjetoJogo.prototype.desenhar = function(contexto) {
  this.ativo && contexto.drawImage(this.img, this.x, this.y, 40, 40);
}
ObjetoJogo.prototype.mover = function(dx, dy) {
  this.x += dx; this.y += dy;
}
ObjetoJogo.prototype.atirar = function(dy) {
  return new Tiro(this.x + 20, this.y + 20, dy);
}
ObjetoJogo.prototype.atingidoPor = function(tiro) {
  if (!this.ativo) return false;
  return (
    tiro.x >= this.x &&
    tiro.x <= this.x + 40 &&
    tiro.y >= this.y &&
    tiro.y <= this.y + 40
  );
}
function Tiro(x, y, dy) {
  this.x = x; this.y = y; this.dy = dy;
}
Tiro.prototype.mover = function() {
  this.y += this.dy;
  return this.y > 0 && this.y < 600;
}
Tiro.prototype.desenhar = function(contexto) {
  contexto.fillStyle = '#4B12BC';
  contexto.fillRect(this.x - 1, this.y, 4, 20);
}
var dxInvasor = -5;
var invasores = [];
var nave = new ObjetoJogo(230, 550, document.getElementById("nave")); 
var tiroInvasor, tiroNave;

function inicializar() {
  contexto.clearRect(0, 0, 500, 600);
  invasores = [];
  var img = document.getElementById("invasor");
  for (var y = 0; y < 3; y++) {
    for (var x = 0; x < 8; x++) {
      invasores.push(new ObjetoJogo(50 + x * 50, 20 + y * 50, img));
    }
  }
  nave = new ObjetoJogo(230, 550, document.getElementById("nave"));
  tiroInvasor = null;
  tiroNave = null;
  pontuacao = 0;
  elementoPontuacao.textContent = pontuacao;
  jogoEmAndamento = false;
  jogoPausado = false;
  botaoPausar.textContent = "Pausar";
}

function desenhar() {
  contexto.fillStyle = '#111';
  contexto.fillRect(0, 0, 500, 600);
  invasores.forEach(inv => inv.desenhar(contexto));
  nave.desenhar(contexto);
  tiroInvasor && tiroInvasor.desenhar(contexto);
  tiroNave && tiroNave.desenhar(contexto);
}

function mover() {
  if (!jogoEmAndamento || jogoPausado) return;
  var xEsquerda = invasores[0].x, xDireita = invasores[invasores.length - 1].x;
  if (xEsquerda <= 20 || xDireita >= 440) dxInvasor = -dxInvasor;
  invasores.forEach(inv => inv.mover(dxInvasor, 0.4)); 
  if (tiroInvasor && !tiroInvasor.mover()) {
    tiroInvasor = null;
  }
  if (!tiroInvasor) {
    var ativos = invasores.filter(i => i.ativo);
    if (ativos.length > 0) {
      var r = ativos[Math.floor(Math.random() * ativos.length)];
      tiroInvasor = r.atirar(22); 
    }
  }
  if (tiroNave) {
    var atingido = invasores.find(inv => inv.atingidoPor(tiroNave));
    if (atingido) {
      atingido.ativo = false;
      pontuacao += 10; 
      elementoPontuacao.textContent = pontuacao;
      tiroNave = null;
    } else {
      if (!tiroNave.mover()) tiroNave = null;
    }
  }

  if (esquerdaPressionada && nave.x > 0) {
    nave.mover(-5, 0);
  }
  if (direitaPressionada && nave.x < 460) {
    nave.mover(5, 0);
  }
}

function verificarGameOver() {
  return nave.atingidoPor(tiroInvasor) || invasores.find(inv => inv.ativo && inv.y > 530);
}

function verificarVitoria() {
  return invasores.every(inv => !inv.ativo);
}

function jogo() {
  if (!jogoEmAndamento || jogoPausado) return;
  mover();
  desenhar();
  if (verificarGameOver()) {
    clearInterval(intervalo);
    mostrarTelaGameOver();
    jogoEmAndamento = false;
  } else if (verificarVitoria()) {
    clearInterval(intervalo);
    mostrarTelaVitoria();
    jogoEmAndamento = false;
  }
}

function iniciar() {
  document.addEventListener("keydown", function(e) {
    if (e.keyCode == 37) {
      esquerdaPressionada = true;
    }
    if (e.keyCode == 39) {
      direitaPressionada = true;
    }
    if (e.keyCode == 32 && !tiroNave && jogoEmAndamento) {
      tiroNave = nave.atirar(-30);
    }
    if (e.keyCode == 80) {
      alternarPausa();
    }
  });

  document.addEventListener("keyup", function(e) {
    if (e.keyCode == 37) {
      esquerdaPressionada = false;
    }
    if (e.keyCode == 39) {
      direitaPressionada = false;
    }
  });

  intervalo = setInterval(jogo, 50);
}

function alternarPausa() {
  if (jogoEmAndamento) {
    jogoPausado = !jogoPausado;
    if (jogoPausado) {
      botaoPausar.textContent = "Continuar";
      telaPausa.style.display = "flex";
    } else {
      botaoPausar.textContent = "Pausar";
      telaPausa.style.display = "none";
    }
  }
}

function mostrarTelaGameOver() {
  mensagemGameOver.innerHTML = `Fim de Jogo<br>Sua pontuação: ${pontuacao}`;
  telaGameOver.style.display = "flex";
}

function mostrarTelaVitoria() {
  mensagemVitoria.innerHTML = `Você Venceu!<br>Sua pontuação: ${pontuacao}`;
  telaVitoria.style.display = "flex";
}

function iniciarJogo() {
  telaIntro.style.display = "none";
  telaGameOver.style.display = "none";
  telaVitoria.style.display = "none";
  telaPausa.style.display = "none";
  inicializar();
  jogoEmAndamento = true;
  iniciar();
}

function reiniciarJogo() {
  telaIntro.style.display = "none";
  telaGameOver.style.display = "none";
  telaVitoria.style.display = "none";
  telaPausa.style.display = "none";
  inicializar();
  jogoEmAndamento = true;
  iniciar();
}

function voltarParaIntro() {
  telaIntro.style.display = "flex";
  telaGameOver.style.display = "none";
  telaVitoria.style.display = "none";
  telaPausa.style.display = "none";
}

function sairParaIndex() {
  window.location.href = '../../index.html'; 
}

window.onload = function() {
  telaIntro.style.display = "flex";
  telaGameOver.style.display = "none";
  telaVitoria.style.display = "none";
  telaPausa.style.display = "none";
  jogoEmAndamento = false;
}