interface BodySnapshot {
  cursor: string;
  userSelect: string;
}

let snapshot: BodySnapshot | undefined;
let lockSequence = 0;
const locks: Array<{ id: number; cursor: string }> = [];

export function lockBodyInteraction(cursor: string): () => void {
  const body = document.body;
  if (locks.length === 0) {
    snapshot = {
      cursor: body.style.cursor,
      userSelect: body.style.userSelect,
    };
  }

  const id = ++lockSequence;
  locks.push({ id, cursor });
  body.style.cursor = cursor;
  body.style.userSelect = 'none';
  let released = false;

  return () => {
    if (released) return;
    released = true;
    const index = locks.findIndex((lock) => lock.id === id);
    if (index >= 0) locks.splice(index, 1);
    const current = locks[locks.length - 1];
    if (current) {
      body.style.cursor = current.cursor;
      body.style.userSelect = 'none';
    } else if (snapshot) {
      body.style.cursor = snapshot.cursor;
      body.style.userSelect = snapshot.userSelect;
      snapshot = undefined;
    }
  };
}
