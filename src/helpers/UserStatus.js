export default {
  status(datetime) {
    let status = "offline";
    let seconds = null;
    if (datetime) {
      const date = new Date(datetime);
      const now = new Date();
      const diff = (now - date) / 1000;
      if (diff <= 60) {
        status = "online";
      }
      seconds = diff;
    }

    const variant = status === "online" ? "success" : "danger";

    return {
      status,
      variant,
      seconds,
      datetime,
    };
  },
};
