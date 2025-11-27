import { useState, useEffect, useMemo } from "react";
import moment from "moment";
import TaskList from "../../components/TaskList/TaskList";

import { api } from "../../api/http";

const normalize = (d) => {
  if (!d) return null;
  const m = moment(d, moment.ISO_8601, true);
  return m.isValid()
    ? m.startOf("day")
    : moment(d, "YYYY-MM-DD", true).startOf("day");
};

const AllTasks = ({ filter = "all" }) => {
  const [raw, setRaw] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const params = new URLSearchParams();

    if (storedUser?.id) {
      params.append("userId", storedUser.id);
    }

    const query = params.toString();
    const pathName = query ? `/api/tasks?${query}` : "/api/tasks";

    const fetchTasks = async () => {
      try {
        const data = await api.get(pathName);
        setRaw(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("? ? ?? ?? ??:", err);
      }
    };

    fetchTasks();
  }, []);

  const tasks = useMemo(() => {
    const today = moment().startOf("day");
    const startOfWeek = moment().startOf("isoWeek").startOf("day");
    const endOfWeek = moment().endOf("isoWeek").endOf("day");
    const startOfMonth = moment().startOf("month").startOf("day");
    const endOfMonth = moment().endOf("month").endOf("day");

    let filtered = raw
      .map((t) => ({ ...t, _m: normalize(t.promiseDate) }))
      .filter((t) => t._m && t._m.isSameOrAfter(today)); // 오늘 이전 약속 제외

    if (filter === "week") {
      filtered = filtered.filter(
        (t) => t._m.isSameOrAfter(startOfWeek) && t._m.isSameOrBefore(endOfWeek)
      );
    } else if (filter === "month") {
      filtered = filtered.filter(
        (t) =>
          t._m.isSameOrAfter(startOfMonth) && t._m.isSameOrBefore(endOfMonth)
      );
    }

    filtered.sort((a, b) => a._m.valueOf() - b._m.valueOf());
    return filtered.map(({ _m, ...rest }) => rest);
  }, [raw, filter]);

  return <TaskList tasks={tasks} />;
};

export default AllTasks;
