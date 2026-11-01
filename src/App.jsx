import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [tarefas, setTarefas] = useState([]);
  const [novaTarefa, setNovaTarefa] = useState('');
  const [filtro, setFiltro] = useState('todas');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    try {
      const tarefasSalvas = localStorage.getItem('tarefas');

      if (tarefasSalvas) {
        const tarefasConvertidas = JSON.parse(tarefasSalvas);

        if (Array.isArray(tarefasConvertidas)) {
          setTarefas(tarefasConvertidas);
        }
      }
    } catch {
      localStorage.removeItem('tarefas');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (!carregando) {
      localStorage.setItem('tarefas', JSON.stringify(tarefas));
    }
  }, [tarefas, carregando]);

  const concluidas = tarefas.filter(
    (tarefa) => tarefa.concluida
  ).length;

  const pendentes = tarefas.length - concluidas;

  const progresso = tarefas.length
    ? Math.round((concluidas / tarefas.length) * 100)
    : 0;

  const tarefasFiltradas = tarefas.filter((tarefa) => {
    if (filtro === 'pendentes') return !tarefa.concluida;
    if (filtro === 'concluidas') return tarefa.concluida;
    return true;
  });

  function adicionarTarefa(evento) {
    evento.preventDefault();

    const texto = novaTarefa.trim();

    if (!texto) return;

    const tarefa = {
      id: crypto.randomUUID(),
      texto,
      concluida: false,
    };

    setTarefas((listaAtual) => [...listaAtual, tarefa]);
    setNovaTarefa('');
  }

  function concluirTarefa(id) {
    setTarefas((listaAtual) =>
      listaAtual.map((tarefa) =>
        tarefa.id === id
          ? { ...tarefa, concluida: !tarefa.concluida }
          : tarefa
      )
    );
  }

  function excluirTarefa(id) {
    setTarefas((listaAtual) =>
      listaAtual.filter((tarefa) => tarefa.id !== id)
    );
  }

  if (carregando) {
    return <p className="carregando">Carregando...</p>;
  }

  return (
    <main className="aplicativo">
      <header className="cabecalho">
        <a className="logo" href="#inicio" aria-label="Foco - início">
          <img src={`${import.meta.env.BASE_URL}logo-foco.png`} alt="Foco" />
        </a>

        <span className="etiqueta">Organize o seu dia</span>
      </header>

      <section className="introducao" id="inicio">
        <h1>Minhas tarefas</h1>
        <p className="descricao">
          Organize o que precisa ser feito.
        </p>
      </section>

      <section className="resumo">
        <div className="resumo-cabecalho">
          <div>
            <p className="resumo-legenda">PROGRESSO</p>
            <h2>
              {tarefas.length === 0
                ? 'Nenhuma tarefa ainda'
                : progresso === 100
                  ? 'Tudo concluído'
                  : 'Resumo do dia'}
            </h2>
          </div>

          <span className="progresso-porcentagem">
            {progresso}%
          </span>
        </div>

        <div
          className="barra-progresso"
          role="progressbar"
          aria-label="Progresso das tarefas"
          aria-valuenow={progresso}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="barra-preenchida"
            style={{ width: `${progresso}%` }}
          />
        </div>

        <div className="resumo-numeros">
          <div className="numero">
            <strong>{pendentes}</strong>
            <span className="numero-legenda">Pendentes</span>
          </div>

          <div className="numero">
            <strong>{concluidas}</strong>
            <span className="numero-legenda">Concluídas</span>
          </div>

          <div className="numero">
            <strong>{tarefas.length}</strong>
            <span className="numero-legenda">Total</span>
          </div>
        </div>

        {tarefas.length > 0 && progresso === 100 && (
          <p className="mensagem-conclusao" role="status">
            Todas as tarefas foram concluídas.
          </p>
        )}
      </section>

      <section className="tarefas">
        <div className="titulo-tarefas">
          <h2>Tarefas</h2>
          <span className="contador-tarefas">
            {tarefas.length}
          </span>
        </div>

        <form className="nova-tarefa" onSubmit={adicionarTarefa}>
          <input
            type="text"
            placeholder="Adicionar uma tarefa..."
            value={novaTarefa}
            onChange={(evento) => setNovaTarefa(evento.target.value)}
            aria-label="Nova tarefa"
            maxLength={120}
          />

          <button type="submit">Adicionar</button>
        </form>

        <div className="filtros" aria-label="Filtrar tarefas">
          <button
            type="button"
            className={filtro === 'todas' ? 'filtro-ativo' : ''}
            onClick={() => setFiltro('todas')}
            aria-pressed={filtro === 'todas'}
          >
            Todas
          </button>

          <button
            type="button"
            className={filtro === 'pendentes' ? 'filtro-ativo' : ''}
            onClick={() => setFiltro('pendentes')}
            aria-pressed={filtro === 'pendentes'}
          >
            Pendentes
          </button>

          <button
            type="button"
            className={filtro === 'concluidas' ? 'filtro-ativo' : ''}
            onClick={() => setFiltro('concluidas')}
            aria-pressed={filtro === 'concluidas'}
          >
            Concluídas
          </button>
        </div>

        {tarefasFiltradas.length === 0 ? (
          <div className="mensagem-vazia">
            {tarefas.length === 0 ? (
              <>
                <h3>Nenhuma tarefa cadastrada</h3>
                <p>Adicione uma tarefa para começar.</p>
              </>
            ) : (
              <>
                <h3>
                  {filtro === 'pendentes'
                    ? 'Nenhuma tarefa pendente'
                    : 'Nenhuma tarefa concluída'}
                </h3>
                <p>As tarefas correspondentes aparecerão aqui.</p>
              </>
            )}
          </div>
        ) : (
          <ul className="lista-tarefas">
            {tarefasFiltradas.map((tarefa) => (
              <li
                key={tarefa.id}
                className={`item-tarefa ${
                  tarefa.concluida ? 'concluida' : ''
                }`}
              >
                <label className="tarefa-conteudo">
                  <input
                    type="checkbox"
                    checked={tarefa.concluida}
                    onChange={() => concluirTarefa(tarefa.id)}
                  />

                  <span className="texto-tarefa">{tarefa.texto}</span>
                </label>

                <button
                  type="button"
                  className="botao-excluir"
                  onClick={() => excluirTarefa(tarefa.id)}
                  aria-label={`Excluir tarefa ${tarefa.texto}`}
                >
                  Excluir
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

<footer className="rodape">
  <p>
    Projeto desenvolvido por{' '}
    <a
      href="https://miguelpoquiviqui.github.io/miguel/"
      target="_blank"
      rel="noopener noreferrer"
    >
      Miguel Poquiviqui
    </a>
  </p>
</footer>
    </main>
  );
}

export default App;