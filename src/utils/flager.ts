export const flager = () => {
  let marked: string[] = []

  const unmark = (id: string) => {
    marked = marked.filter(x => x !== id)
  }

  const unmarkAll = () => {
    marked = []
  }

  const isMarked = (id: string) => marked.some(x => x === id)

  const mark = (id: string) => {
    marked.push(id)
  }

  return {
    mark,
    unmark,
    unmarkAll,
    isMarked,
  }
}
