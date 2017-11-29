export const flager = () => {
  let marked = [];

  const unmark = (id: string) => {
    marked = marked.filter(x => x !== id);
  };

  const unmarkAll = () => {
    marked = [];
  };

  const isMarked = (id: string) => {
    return marked.some(x => x === id);
  };

  const mark = (id: string) => {
    marked.push(id);
  };

  return {
    mark,
    unmark,
    unmarkAll,
    isMarked,
  }
}