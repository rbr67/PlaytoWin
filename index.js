require("dotenv").config();
const express = require("express");
const conn = require("./db/conn");
const handlebars = require("express-handlebars");
const Usuario = require("./models/Usuario");
const Jogo = require("./models/Jogo");
const Cartao = require("./models/Cartao");
const Conquista = require("./models/Conquista")
const { DataTypes } = require("sequelize");

const app = express();
app.engine("handlebars", handlebars.engine())
app.set("view engine", "handlebars")

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.render("home");
});


app.post("/usuarios/novo", async (req, res) => {
  const dadosUsuario = {
    nickname: req.body.nickname,
    nome: req.body.nome
  };

  const usuario = await Usuario.create(dadosUsuario);
  res.send("Usuário cadastrado com id " + usuario.id);
});

app.get("/usuarios/novo", (req, res) => {
  res.render("formularioDoUsuario");
});

app.get("/usuarios", async (req, res) => {
  const usuarios = await Usuario.findAll({ raw: true });
  res.render("usuarios", { usuarios });
});

app.get("/usuarios/:id/atualizar", async (req, res) => {
  const id = req.params.id;
  const usuario = await Usuario.findByPk(id, { raw: true });
  res.render("formularioDoUsuario", { usuario });
});

app.post("/usuarios/:id/atualizar", async (req, res) => {
  const id = req.params.id;

  const dadosUsuario = {
    nickname: req.body.nickname,
    nome: req.body.nome
  };
  const registroAfetados = await Usuario.update(dadosUsuario, { where: { id: id } });
  if (registroAfetados > 0) {
    res.redirect("/usuarios");
  } else {
    res.send("Erro ao atualizar usuário");
  }
});

app.post("/usuarios/excluir", async (req, res) => {
  const id = req.body.id
  const registroAfetados = await Usuario.destroy({ where: { id: id } });

  if (registroAfetados > 0) {
    res.redirect("/usuarios");
  } else {
    res.send("Erro ao excluir usuário");
  }
});

app.post("/jogos/novo", async (req, res) => {
  const dadosJogo = {
    titulo: req.body.titulo,
    descricao: req.body.descricao,
    precoBase: req.body.precoBase
  };

  const jogo = await Jogo.create(dadosJogo);
  res.send("Jogo cadastrado com id " + jogo.id);
});

app.get("/jogos/novo", (req, res) => {
  res.render("formularioDoJogo");
});

app.get("/jogos", async (req, res) => {
  const jogos = await Jogo.findAll({ raw: true });
  res.render("jogos", { jogos });
});

app.get("/jogos/:id/atualizar", async (req, res) => {
  const id = req.params.id;
  const jogo = await Jogo.findByPk(id, { raw: true });
  res.render("formularioDoJogo", { jogo });
});

app.post("/jogos/:id/atualizar", async (req, res) => {
  const id = req.params.id;

  const dadosJogo = {
    titulo: req.body.titulo,
    descricao: req.body.descricao,
    precoBase: req.body.precoBase
  };
  const registroAfetados = await Jogo.update(dadosJogo, { where: { id: id } });
  if (registroAfetados > 0) {
    res.redirect("/jogos");
  } else {
    res.send("Erro ao atualizar jogo");
  }
});

app.post("/jogos/excluir", async (req, res) => {
  const id = req.body.id
  const registroAfetados = await Jogo.destroy({ where: { id: id } });

  if (registroAfetados > 0) {
    res.redirect("/jogos");
  } else {
    res.send("Erro ao excluir jogo");
  }
});



app.get('/usuarios/:id/cartoes', async (req, res) => {
  const id = parseInt(req.params.id)
  const usuario = await Usuario.findByPk(id, { include: ["Cartaos"] });

  let cartoes = usuario.Cartaos;
  cartoes = cartoes.map((cartao) => cartao.toJSON())


  res.render("Cartoes.handlebars", { usuario: usuario.toJSON(), cartoes });
});


app.get("/usuarios/:id/novoCartao", async (req, res) => {
  const id = parseInt(req.params.id);
  const usuario = await Usuario.findByPk(id, { raw: true });

  res.render("formumalarioDoCartao", { usuario });
});


app.post("/usuarios/:id/novoCartao", async (req, res) => {
  const id = parseInt(req.params.id);

  const dadosCartao = {
    numero: req.body.numero,
    nome: req.body.nome,
    cvv: req.body.codSeguranca,
    UsuarioId: id,
  };

  await Cartao.create(dadosCartao);

  res.redirect(`/usuarios/${id}/cartoes`);
});


app.get('/jogos/:id/conquistas', async (req, res) => {
  const id = parseInt(req.params.id)
  const jogo = await Jogo.findByPk(id, { include: ["Conquista"] });

  let conquistas = jogo.Conquista;
  conquistas = conquistas.map((conquista) => conquista.toJSON())


  res.render("Conquista.handlebars", { jogo: jogo.toJSON(), conquistas });
});


app.get("/jogos/:id/novaConquista", async (req, res) => {
  const id = parseInt(req.params.id);
  const jogo = await Jogo.findByPk(id, { raw: true });

  res.render("formularioDoConquista", { jogo });
});

app.post("/jogos/:id/novaConquista", async (req, res) => {
  const id = parseInt(req.params.id);

  const dadosConquista = {
    titulo: req.body.titulo,
    descricao: req.body.descricao,
    JogoId: id,
  };

  await Conquista.create(dadosConquista);

  res.redirect(`/jogos/${id}/conquistas`);
});


app.listen(8000, () => {
  console.log("Servidor rodando");
});

conn
  .sync()
  .then(() => {
    console.log("Conectado ao banco de dados com sucesso!");
  })
  .catch((err) => {
    console.error("Ocorreu um erro ao conectar ao banco de dados:", err);
  });