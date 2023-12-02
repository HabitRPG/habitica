import addTaskTotal from '../../website/common/script/addTotalTasks';

describe('contador de tarefas criadas', () => {
  it('deveria acrescentar mais 1 na contagem da task retornando 1', () => {
    expect(addTaskTotal('task')).to.equal(1);
  });

  it('deveria acrescentar mais 1 na contagem do habit retornando 1', () => {
    expect(addTaskTotal('habit')).to.equal(1);
  });

  it('deveria fazer a contagem do habit retornando 2, pois já foi chamado duas vezes', () => {
    expect(addTaskTotal('habit')).to.equal(2);
  });

  it('deveria acrescentar mais 1 na contagem da daily retornando 1', () => {
    expect(addTaskTotal('daily')).to.equal(1);
  });

  it('deveria fazer a contagem da daily retornando 2, pois já foi chamado duas vezes', () => {
    expect(addTaskTotal('daily')).to.equal(2);
  });

  it('deveria fazer a contagem da daily retornando 3, pois já foi chamado três vezes', () => {
    expect(addTaskTotal('daily')).to.equal(3);
  });

  it('deveria acrescentar mais 1 na contagem do todo retornando 1', () => {
    expect(addTaskTotal('todo')).to.equal(1);
  });

  it('deveria fazer a contagem do todo retornando 2, pois já foi chamado duas vezes', () => {
    expect(addTaskTotal('todo')).to.equal(2);
  });

  it('deveria retorna -1, pois essa entrada de string não é válida', () => {
    expect(addTaskTotal('ABC')).to.equal(-1);
  });

  it('deveria retorna -1, pois essa entrada de número não é válida', () => {
    expect(addTaskTotal(123)).to.equal(-1);
  });
});