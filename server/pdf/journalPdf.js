const React = require("react");
const {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} = require("@react-pdf/renderer");

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#111827",
  },
  header: {
    marginBottom: 16,
    borderBottom: "1 solid #e5e7eb",
    paddingBottom: 8,
  },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#6b7280" },

  columns: {
    flexDirection: "row",
    gap: 14,
  },
  col: {
    flex: 1,
    border: "1 solid #e5e7eb",
    borderRadius: 8,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 8,
    color: "#4f46e5",
  },
  row: { marginBottom: 6 },
  label: { fontSize: 10, color: "#6b7280" },
  value: { fontSize: 11, marginTop: 2 },
  taskItem: {
    marginBottom: 4,
    flexDirection: "row",
  },
  taskStatus: {
    width: 24,
    fontWeight: 700,
  },
  taskText: {
    flex: 1,
  },
  muted: { color: "#9ca3af" },
});

function moodLabel(v) {
  const n = Number(v);
  if (n == 0) return "Awful";
  if (n == 1) return "Bad";
  if (n == 2) return "Neutral";
  if (n == 3) return "Great";
  return "Amazing";
}

function energyLabel(v) {
  const n = Number(v);
  if (n == 0) return "Exhausted";
  if (n == 1) return "Low";
  if (n == 2) return "Neutral";
  if (n == 3) return "Energized";
  return "Full of Energy";
}

function bool(v) {
  return v ? "Yes" : "No";
}

async function generatePdf({ entry, tasks, email, date }) {
  const doc = React.createElement(
    Document,
    { title: `Journal - ${date}` },
    null,
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, { style: styles.title }, "Daily Journal"),
        React.createElement(
          Text,
          { style: styles.subtitle },
          `Date: ${date}   •   User: ${email}`,
        ),
      ),

      React.createElement(
        View,
        { style: styles.columns },

        // LEFT
        React.createElement(
          View,
          { style: styles.col },
          React.createElement(
            Text,
            { style: styles.sectionTitle },
            "Well-being",
          ),
          React.createElement(
            View,
            { style: styles.row },
            React.createElement(Text, { style: styles.label }, "Mood"),
            React.createElement(
              Text,
              { style: styles.value },
              moodLabel(entry.mood),
            ),
          ),
          React.createElement(
            View,
            { style: styles.row },
            React.createElement(Text, { style: styles.label }, "Energy"),
            React.createElement(
              Text,
              { style: styles.value },
              energyLabel(entry.energy),
            ),
          ),
          React.createElement(
            View,
            { style: styles.row },
            React.createElement(Text, { style: styles.label }, "Sleep hours"),
            React.createElement(
              Text,
              { style: styles.value },
              entry.sleep_hours == null ? "-" : String(entry.sleep_hours),
            ),
          ),
          React.createElement(
            View,
            { style: styles.row },
            React.createElement(Text, { style: styles.label }, "Ate healthy"),
            React.createElement(
              Text,
              { style: styles.value },
              bool(entry.ate_healthy),
            ),
          ),
          React.createElement(
            View,
            { style: styles.row },
            React.createElement(Text, { style: styles.label }, "Workout done"),
            React.createElement(
              Text,
              { style: styles.value },
              bool(entry.workout_done),
            ),
          ),
          React.createElement(
            View,
            { style: styles.row },
            React.createElement(
              Text,
              { style: styles.label },
              "Meditation done",
            ),
            React.createElement(
              Text,
              { style: styles.value },
              bool(entry.meditation_done),
            ),
          ),
        ),

        // RIGHT
        React.createElement(
          View,
          { style: styles.col },
          React.createElement(
            Text,
            { style: styles.sectionTitle },
            "Reflection",
          ),
          React.createElement(
            View,
            { style: styles.row },
            React.createElement(Text, { style: styles.label }, "Thoughts"),
            React.createElement(
              Text,
              { style: styles.value },
              entry.thoughts || "-",
            ),
          ),
          React.createElement(
            View,
            { style: styles.row },
            React.createElement(Text, { style: styles.label }, "Gratitude"),
            React.createElement(
              Text,
              { style: styles.value },
              entry.gratitude || "-",
            ),
          ),
          React.createElement(Text, { style: styles.sectionTitle }, "Tasks"),
          tasks?.length
            ? tasks.map((t, i) =>
                React.createElement(
                  View,
                  { key: `task-${i}`, style: styles.taskItem },
                  React.createElement(
                    Text,
                    { style: styles.taskStatus },
                    t.completed ? "[x]" : "[ ]",
                  ),
                  React.createElement(
                    Text,
                    { style: styles.taskText },
                    t.task_description || "",
                  ),
                ),
              )
            : React.createElement(
                Text,
                { style: [styles.value, styles.muted] },
                "No tasks",
              ),
        ),
      ),
    ),
  );

  return renderToBuffer(doc);
}

module.exports = { generatePdf };
