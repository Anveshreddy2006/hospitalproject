export const ensure = (cond, msg = "Bad request", code = 400) => {
  if (!cond) {
    const err = new Error(msg);
    err.status = code;
    throw err;
  }
};

export const isFuture = (d) => new Date(d).getTime() > Date.now();
