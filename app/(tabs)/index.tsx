import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type KeyboardTypeOptions } from "react-native";
import { type PropsWithChildren, useMemo, useState } from "react";

import { WorldMap } from "@/components/education/world-map";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ScreenContainer } from "@/components/screen-container";
import { defaultExplanation, EDUCATION_EVENTS, EXPLANATION_LEVELS, type ExplanationLevel, type LessonEvent } from "@/lib/education";
import { useEducation } from "@/lib/education-store";
import { trpc } from "@/lib/trpc";

type ModalTarget = "none" | "classroom" | "student";

const eventIcons = {
  Trovoada: "bolt",
  "Chuva intensa": "rain",
  "Ventos fortes": "wind",
  "Onda de calor": "thermostat",
  "Baixa visibilidade": "fog",
} as const;

const severityColors = { alto: "#DF5C69", moderado: "#ECA63D", observação: "#2D8CDA" } as const;

export default function EducationWebScreen() {
  const {
    institutionName,
    teacherName,
    students,
    classrooms,
    activeClassroom,
    role,
    setRole,
    selectedEvent,
    selectEvent,
    createClassroom,
    addStudent,
    sendEventToClass,
    togglePresentation,
    alertsEnabled,
    setAlertsEnabled,
  } = useEducation();
  const [level, setLevel] = useState<ExplanationLevel>("leigo");
  const [modal, setModal] = useState<ModalTarget>("none");
  const [className, setClassName] = useState("");
  const [classLevel, setClassLevel] = useState("Ensino Fundamental II");
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const adaptation = trpc.education.adaptExplanation.useMutation({
    onSuccess: (data) => {
      setAiExplanation(data.content);
      setAiError(null);
    },
    onError: () => setAiError("A adaptação por IA está indisponível. A explicação pedagógica local continua disponível."),
  });

  const liveEvent = EDUCATION_EVENTS.find((event) => event.id === activeClassroom.activeEventId) ?? selectedEvent;
  const displayEvent = role === "student" ? liveEvent : selectedEvent;
  const currentStudents = students.filter((student) => activeClassroom.studentIds.includes(student.id));
  const fallbackExplanation = useMemo(() => defaultExplanation(displayEvent, level), [displayEvent, level]);
  const explanation = aiExplanation ?? fallbackExplanation;

  function chooseEvent(id: string) {
    selectEvent(id);
    setAiExplanation(null);
    setAiError(null);
  }

  function changeLevel(nextLevel: ExplanationLevel) {
    setLevel(nextLevel);
    setAiExplanation(null);
    setAiError(null);
  }

  function adaptWithAi() {
    setAiError(null);
    adaptation.mutate({
      eventType: displayEvent.type,
      city: displayEvent.city,
      level,
      formation: displayEvent.formation,
      impacts: displayEvent.impacts,
      mitigation: displayEvent.mitigation,
    });
  }

  function submitClassroom() {
    createClassroom(className, classLevel, selectedEvent.city);
    setClassName("");
    setModal("none");
  }

  function submitStudent() {
    addStudent(studentName, studentEmail);
    setStudentName("");
    setStudentEmail("");
    setModal("none");
  }

  return (
    <ScreenContainer edges={[]}>
      <View style={styles.page}>
        <Header institution={institutionName} teacher={teacherName} role={role} setRole={setRole} live={activeClassroom.isPresenting} />
        <View style={styles.workspace}>
          <Sidebar
            role={role}
            className={activeClassroom.name}
            studentCount={currentStudents.length}
            onNewClass={() => setModal("classroom")}
            onNewStudent={() => setModal("student")}
          />
          <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
            <View style={styles.headingRow}>
              <View>
                <Text style={styles.eyebrow}>{role === "teacher" ? "PAINEL DO PROFESSOR" : "ACOMPANHAMENTO DO ALUNO"}</Text>
                <Text style={styles.title}>{role === "teacher" ? "Aula de meteorologia em ação" : activeClassroom.isPresenting ? "A aula está ao vivo" : "Aguarde o professor iniciar"}</Text>
                <Text style={styles.subtitle}>{activeClassroom.name} · {activeClassroom.educationLevel} · {activeClassroom.city}</Text>
              </View>
              {role === "teacher" && (
                <View style={styles.headingActions}>
                  <ActionButton icon="send" label="Enviar à turma" variant="outline" onPress={sendEventToClass} />
                  <ActionButton icon={activeClassroom.isPresenting ? "pause" : "play"} label={activeClassroom.isPresenting ? "Pausar apresentação" : "Iniciar apresentação"} onPress={togglePresentation} />
                </View>
              )}
            </View>

            <View style={styles.mainGrid}>
              <View style={styles.mapColumn}>
                <WorldMap events={EDUCATION_EVENTS} selectedEventId={displayEvent.id} onSelect={chooseEvent} />
                <View style={styles.mapFooter}>
                  <Legend color="#DF5C69" label="Alto risco" />
                  <Legend color="#ECA63D" label="Atenção" />
                  <Legend color="#2D8CDA" label="Observação" />
                  <Text style={styles.source}>Fonte: Open-Meteo · uso educacional</Text>
                </View>
              </View>
              <LessonPanel event={displayEvent} role={role} live={activeClassroom.isPresenting} explanation={explanation} aiError={aiError} level={level} setLevel={changeLevel} isGenerating={adaptation.isPending} onAdapt={adaptWithAi} />
            </View>

            {role === "teacher" ? (
              <TeacherTools
                classrooms={classrooms}
                students={currentStudents}
                selectedEvent={selectedEvent}
                chooseEvent={chooseEvent}
                alertsEnabled={alertsEnabled}
                setAlertsEnabled={setAlertsEnabled}
                onAddStudent={() => setModal("student")}
              />
            ) : (
              <StudentView event={liveEvent} isPresenting={activeClassroom.isPresenting} explanation={explanation} />
            )}

            <View style={styles.disclaimer}>
              <IconSymbol name="info" size={17} color="#4675A4" />
              <Text style={styles.disclaimerText}>Eventos desta tela formam um cenário de monitoramento educativo. Antes de decisões de segurança, consulte fontes oficiais e autoridades locais.</Text>
            </View>
          </ScrollView>
        </View>

        <FormModal visible={modal === "classroom"} title="Criar uma aula" button="Criar aula" onClose={() => setModal("none")} onSubmit={submitClassroom}>
          <TextField label="Nome da aula" value={className} onChange={setClassName} placeholder="Ex.: Clima e cidade" />
          <TextField label="Nível educacional" value={classLevel} onChange={setClassLevel} placeholder="Ex.: Ensino Fundamental II" />
        </FormModal>
        <FormModal visible={modal === "student"} title="Adicionar aluno" button="Adicionar à turma" onClose={() => setModal("none")} onSubmit={submitStudent}>
          <TextField label="Nome completo" value={studentName} onChange={setStudentName} placeholder="Nome do aluno" />
          <TextField label="E-mail institucional" value={studentEmail} onChange={setStudentEmail} placeholder="aluno@instituicao.edu.br" keyboardType="email-address" />
        </FormModal>
      </View>
    </ScreenContainer>
  );
}

function Header({ institution, teacher, role, setRole, live }: { institution: string; teacher: string; role: "teacher" | "student"; setRole: (role: "teacher" | "student") => void; live: boolean }) {
  return <View style={styles.header}><View style={styles.brandGroup}><View style={styles.brandMark}><IconSymbol name="radar" size={22} color="#FFFFFF" /></View><View><Text style={styles.brand}>Radar do Tempo</Text><Text style={styles.brandSub}>EDUCAÇÃO</Text></View><View style={styles.headerDivider} /><View><Text style={styles.institution}>{institution}</Text><Text style={styles.institutionSub}>AMBIENTE DE APRENDIZAGEM</Text></View></View><View style={styles.headerRight}>{live && <View style={styles.livePill}><View style={styles.liveDot} /><Text style={styles.liveText}>AULA AO VIVO</Text></View>}<View style={styles.roleSwitch}><RoleButton active={role === "teacher"} icon="school" label="Professor" onPress={() => setRole("teacher")} /><RoleButton active={role === "student"} icon="group" label="Aluno" onPress={() => setRole("student")} /></View><View style={styles.avatar}><Text style={styles.avatarText}>{teacher.charAt(0)}</Text></View></View></View>;
}

function RoleButton({ active, icon, label, onPress }: { active: boolean; icon: string; label: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.roleButton, active && styles.roleButtonActive, pressed && styles.pressed]}><IconSymbol name={icon} size={15} color={active ? "#FFFFFF" : "#6E8499"} /><Text style={[styles.roleButtonText, active && styles.roleButtonTextActive]}>{label}</Text></Pressable>;
}

function Sidebar({ role, className, studentCount, onNewClass, onNewStudent }: { role: "teacher" | "student"; className: string; studentCount: number; onNewClass: () => void; onNewStudent: () => void }) {
  return <View style={styles.sidebar}><Text style={styles.navLabel}>{role === "teacher" ? "GESTÃO EDUCACIONAL" : "SUA EXPERIÊNCIA"}</Text><NavItem icon="dashboard" text="Visão geral" active /><NavItem icon="public" text="Mapa global" /><NavItem icon="calendar" text={role === "teacher" ? "Minhas aulas" : "Minha aula"} /><NavItem icon="group" text={role === "teacher" ? "Turmas e alunos" : "Minha turma"} /><NavItem icon="history" text="Histórico" /><View style={styles.sideSpacer} /><View style={styles.activeClass}><Text style={styles.activeClassLabel}>TURMA ATIVA</Text><Text style={styles.activeClassName}>{className}</Text><Text style={styles.activeClassMeta}>{studentCount} aluno{studentCount === 1 ? "" : "s"} vinculados</Text></View>{role === "teacher" && <><ActionButton icon="add" label="Nova aula" variant="outline" onPress={onNewClass} /><View style={styles.sideButtonGap} /><ActionButton icon="person-add" label="Adicionar aluno" variant="outline" onPress={onNewStudent} /></>}</View>;
}

function NavItem({ icon, text, active = false }: { icon: string; text: string; active?: boolean }) { return <Pressable style={({ pressed }) => [styles.navItem, active && styles.navItemActive, pressed && styles.pressed]}><IconSymbol name={icon} size={18} color={active ? "#2D8CDA" : "#74899D"} /><Text style={[styles.navText, active && styles.navTextActive]}>{text}</Text></Pressable>; }
function Legend({ color, label }: { color: string; label: string }) { return <View style={styles.legend}><View style={[styles.legendDot, { backgroundColor: color }]} /><Text style={styles.legendText}>{label}</Text></View>; }
function ActionButton({ icon, label, onPress, variant = "solid" }: { icon: string; label: string; onPress: () => void; variant?: "solid" | "outline" }) { return <Pressable onPress={onPress} style={({ pressed }) => [styles.actionButton, variant === "outline" ? styles.actionOutline : styles.actionSolid, pressed && styles.pressed]}><IconSymbol name={icon} size={16} color={variant === "outline" ? "#2D8CDA" : "#FFFFFF"} /><Text style={[styles.actionText, variant === "outline" && styles.actionTextOutline]}>{label}</Text></Pressable>; }

function LessonPanel({ event, role, live, explanation, aiError, level, setLevel, isGenerating, onAdapt }: { event: LessonEvent; role: "teacher" | "student"; live: boolean; explanation: string; aiError: string | null; level: ExplanationLevel; setLevel: (level: ExplanationLevel) => void; isGenerating: boolean; onAdapt: () => void }) {
  const color = severityColors[event.severity];
  return <View style={styles.lessonPanel}><View style={styles.eventHeader}><View style={[styles.eventIcon, { backgroundColor: `${color}1E` }]}><IconSymbol name={eventIcons[event.type]} size={25} color={color} /></View><View style={styles.eventHeaderText}><Text style={styles.eventTag}>{event.severity === "alto" ? "ALTO RISCO · MONITORAMENTO" : "EVENTO EM MONITORAMENTO"}</Text><Text style={styles.eventTitle}>{event.type}</Text><Text style={styles.eventPlace}><IconSymbol name="location" size={13} color="#6B8195" /> {event.city}, {event.country}</Text></View></View>{role === "student" && <View style={styles.studentNotice}><IconSymbol name={live ? "play" : "schedule"} size={14} color="#4F79A4" /><Text style={styles.studentNoticeText}>{live ? "Conteúdo enviado pelo professor" : "Apresentação ainda não iniciada"}</Text></View>}<Text style={styles.sectionLabel}>EXPLICAÇÃO ADAPTADA</Text><View style={styles.levelRow}>{EXPLANATION_LEVELS.map((item) => <Pressable key={item.id} onPress={() => setLevel(item.id)} style={({ pressed }) => [styles.levelButton, level === item.id && styles.levelButtonActive, pressed && styles.pressed]}><Text style={[styles.levelText, level === item.id && styles.levelTextActive]}>{item.label}</Text></Pressable>)}</View><Text style={styles.explanation}>{explanation}</Text><Pressable onPress={onAdapt} disabled={isGenerating} style={({ pressed }) => [styles.aiButton, isGenerating && styles.aiButtonDisabled, pressed && styles.pressed]}><IconSymbol name="auto-awesome" size={17} color="#FFFFFF" /><Text style={styles.aiButtonText}>{isGenerating ? "Adaptando explicação…" : "Adaptar com IA generativa"}</Text></Pressable><Text style={styles.aiNote}>A IA adapta a linguagem; a turma deve verificar dados e discutir limites da previsão.</Text>{aiError && <Text style={styles.aiError}>{aiError}</Text>}<Text style={styles.sectionLabel}>IMPACTOS E MITIGAÇÃO</Text><BulletGroup icon="warning" color="#DF5C69" title="Impactos potenciais" items={event.impacts} /><BulletGroup icon="shield" color="#2D8CDA" title="Redução de riscos" items={event.mitigation} /><View style={styles.sourceBox}><IconSymbol name="data" size={16} color="#4E7397" /><View style={styles.sourceCopy}><Text style={styles.sourceTitle}>Fonte do dado</Text><Text style={styles.sourceDescription}>{event.source} · atualizado {event.updatedAt}</Text></View></View></View>;
}

function BulletGroup({ icon, color, title, items }: { icon: string; color: string; title: string; items: string[] }) { return <View style={styles.bulletGroup}><View style={styles.bulletHead}><IconSymbol name={icon} size={16} color={color} /><Text style={styles.bulletTitle}>{title}</Text></View>{items.map((item) => <View key={item} style={styles.bulletRow}><View style={[styles.bullet, { backgroundColor: color }]} /><Text style={styles.bulletText}>{item}</Text></View>)}</View>; }

function TeacherTools({ classrooms, students, selectedEvent, chooseEvent, alertsEnabled, setAlertsEnabled, onAddStudent }: { classrooms: { id: string; name: string; educationLevel: string; studentIds: string[] }[]; students: { id: string; name: string; email: string }[]; selectedEvent: LessonEvent; chooseEvent: (id: string) => void; alertsEnabled: boolean; setAlertsEnabled: (value: boolean) => void; onAddStudent: () => void }) {
  return <View style={styles.tools}><View style={styles.toolsHeader}><View><Text style={styles.toolsTitle}>Organize a aula</Text><Text style={styles.toolsSubtitle}>Escolha uma cidade, ajuste o evento e conduza a discussão.</Text></View><ActionButton icon="person-add" label="Cadastrar aluno" variant="outline" onPress={onAddStudent} /></View><View style={styles.toolGrid}><View style={styles.toolCard}><Text style={styles.cardLabel}>AULAS DA INSTITUIÇÃO</Text>{classrooms.map((classroom) => <View key={classroom.id} style={styles.row}><View style={styles.rowIcon}><IconSymbol name="menu-book" size={17} color="#2D8CDA" /></View><View style={styles.rowCopy}><Text style={styles.rowTitle}>{classroom.name}</Text><Text style={styles.rowMeta}>{classroom.educationLevel} · {classroom.studentIds.length} alunos</Text></View><IconSymbol name="chevron.right" size={18} color="#91A2B2" /></View>)}</View><View style={styles.toolCard}><Text style={styles.cardLabel}>CIDADES EM MONITORAMENTO</Text>{EDUCATION_EVENTS.map((event) => <Pressable key={event.id} onPress={() => chooseEvent(event.id)} style={({ pressed }) => [styles.row, selectedEvent.id === event.id && styles.rowSelected, pressed && styles.pressed]}><View style={[styles.signal, { backgroundColor: severityColors[event.severity] }]} /><View style={styles.rowCopy}><Text style={styles.rowTitle}>{event.city}</Text><Text style={styles.rowMeta}>{event.type} · {event.country}</Text></View>{selectedEvent.id === event.id && <IconSymbol name="check" size={18} color="#2D8CDA" />}</Pressable>)}</View><View style={styles.toolCard}><Text style={styles.cardLabel}>ALERTAS E TURMA</Text><View style={styles.settingRow}><View style={styles.rowCopy}><Text style={styles.rowTitle}>Alertas de alto risco</Text><Text style={styles.rowMeta}>Avisar sobre eventos perto da cidade da aula.</Text></View><Pressable onPress={() => setAlertsEnabled(!alertsEnabled)} style={({ pressed }) => [styles.toggle, alertsEnabled && styles.toggleActive, pressed && styles.pressed]}><View style={[styles.toggleCircle, alertsEnabled && styles.toggleCircleActive]} /></Pressable></View><View style={styles.studentCountRow}><Text style={styles.rowTitle}>Alunos vinculados</Text><Text style={styles.count}>{students.length}</Text></View>{students.slice(0, 4).map((student) => <View key={student.id} style={styles.studentRow}><View style={styles.studentAvatar}><Text style={styles.studentAvatarText}>{student.name.charAt(0)}</Text></View><View><Text style={styles.rowTitle}>{student.name}</Text><Text style={styles.rowMeta}>{student.email}</Text></View></View>)}</View></View></View>;
}

function StudentView({ event, isPresenting, explanation }: { event: LessonEvent; isPresenting: boolean; explanation: string }) { return <View style={styles.studentView}><View style={styles.studentHero}><View><Text style={styles.cardLabel}>MODO ALUNO</Text><Text style={styles.studentTitle}>{isPresenting ? "Acompanhe a explicação da turma" : "A aula ainda não começou"}</Text><Text style={styles.studentCopy}>{isPresenting ? `O professor está explorando ${event.type} em ${event.city}.` : "Assim que o professor iniciar, o evento compartilhado aparecerá aqui."}</Text></View><View style={styles.studentHeroIcon}><IconSymbol name="school" size={30} color="#FFFFFF" /></View></View>{isPresenting && <View style={styles.questionCard}><Text style={styles.cardLabel}>PERGUNTA PARA DISCUSSÃO</Text><Text style={styles.questionTitle}>Como os impactos de {event.type.toLocaleLowerCase("pt-BR")} podem variar entre bairros ou grupos sociais?</Text><Text style={styles.questionCopy}>{explanation.slice(0, 230)}…</Text></View>}</View>; }

function TextField({ label, value, onChange, placeholder, keyboardType }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; keyboardType?: KeyboardTypeOptions }) { return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor="#8B9DAD" keyboardType={keyboardType} style={styles.input} /></View>; }

function FormModal({ visible, title, button, onClose, onSubmit, children }: PropsWithChildren<{ visible: boolean; title: string; button: string; onClose: () => void; onSubmit: () => void }>) { return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}><View style={styles.modalOverlay}><Pressable style={StyleSheet.absoluteFill} onPress={onClose} /><View style={styles.modalCard}><View style={styles.modalHeader}><Text style={styles.modalTitle}>{title}</Text><Pressable onPress={onClose} style={styles.modalClose}><Text style={styles.modalCloseText}>×</Text></Pressable></View>{children}<Pressable onPress={onSubmit} style={({ pressed }) => [styles.submit, pressed && styles.pressed]}><Text style={styles.submitText}>{button}</Text></Pressable></View></View></Modal>; }

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F5F8FC" },
  header: { minHeight: 70, paddingHorizontal: 24, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#DFE8F0", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brandGroup: { flexDirection: "row", alignItems: "center", gap: 10 }, brandMark: { width: 38, height: 38, borderRadius: 13, backgroundColor: "#0D2344", alignItems: "center", justifyContent: "center" }, brand: { color: "#102A4B", fontSize: 16, lineHeight: 20, fontWeight: "800" }, brandSub: { color: "#2D8CDA", fontSize: 9, lineHeight: 12, letterSpacing: 1, fontWeight: "800" }, headerDivider: { width: 1, height: 30, backgroundColor: "#DBE5EF", marginHorizontal: 4 }, institution: { color: "#2B4560", fontSize: 12, lineHeight: 16, fontWeight: "800" }, institutionSub: { color: "#8598AA", fontSize: 8, lineHeight: 11, letterSpacing: 0.7, fontWeight: "800" }, headerRight: { flexDirection: "row", alignItems: "center", gap: 11 }, livePill: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FFF0F2", paddingHorizontal: 9, paddingVertical: 6, borderRadius: 12 }, liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#DF5C69" }, liveText: { color: "#C34255", fontSize: 9, lineHeight: 12, letterSpacing: 0.7, fontWeight: "800" }, roleSwitch: { flexDirection: "row", gap: 3, padding: 3, backgroundColor: "#EEF3F8", borderRadius: 12 }, roleButton: { minHeight: 29, flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 9, paddingHorizontal: 9 }, roleButtonActive: { backgroundColor: "#2D8CDA" }, roleButtonText: { color: "#6E8499", fontSize: 11, lineHeight: 15, fontWeight: "800" }, roleButtonTextActive: { color: "#FFFFFF" }, avatar: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "#D8EDFC" }, avatarText: { color: "#1B76BB", fontSize: 14, lineHeight: 18, fontWeight: "800" },
  workspace: { flex: 1, flexDirection: "row" }, sidebar: { width: 220, padding: 18, backgroundColor: "#FFFFFF", borderRightWidth: 1, borderRightColor: "#DFE8F0" }, navLabel: { color: "#7C91A6", fontSize: 9, lineHeight: 13, letterSpacing: 0.8, fontWeight: "800", marginBottom: 8 }, navItem: { minHeight: 40, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 10, borderRadius: 11, marginBottom: 3 }, navItemActive: { backgroundColor: "#EAF5FE" }, navText: { color: "#667D94", fontSize: 12, lineHeight: 16, fontWeight: "700" }, navTextActive: { color: "#176FBA", fontWeight: "800" }, sideSpacer: { flex: 1 }, activeClass: { backgroundColor: "#0D2344", borderRadius: 16, padding: 13, marginBottom: 10 }, activeClassLabel: { color: "#9EBCD8", fontSize: 8, lineHeight: 11, letterSpacing: 0.7, fontWeight: "800" }, activeClassName: { color: "#FFFFFF", fontSize: 13, lineHeight: 18, fontWeight: "800", marginTop: 3 }, activeClassMeta: { color: "#BED0E2", fontSize: 10, lineHeight: 14, fontWeight: "600", marginTop: 2 }, sideButtonGap: { height: 7 },
  content: { flex: 1 }, contentInner: { minWidth: 940, padding: 24 }, headingRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20 }, eyebrow: { color: "#2D8CDA", fontSize: 9, lineHeight: 13, letterSpacing: 0.8, fontWeight: "800" }, title: { color: "#173553", fontSize: 28, lineHeight: 34, fontWeight: "800", marginTop: 2 }, subtitle: { color: "#73889E", fontSize: 12, lineHeight: 17, fontWeight: "600", marginTop: 2 }, headingActions: { flexDirection: "row", gap: 9 }, actionButton: { minHeight: 38, borderRadius: 11, paddingHorizontal: 11, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 }, actionSolid: { backgroundColor: "#2D8CDA" }, actionOutline: { borderWidth: 1, borderColor: "#BED7EB", backgroundColor: "#FFFFFF" }, actionText: { color: "#FFFFFF", fontSize: 10, lineHeight: 14, fontWeight: "800" }, actionTextOutline: { color: "#2D8CDA" }, mainGrid: { flexDirection: "row", gap: 18 }, mapColumn: { flex: 1, minWidth: 0 }, mapFooter: { minHeight: 40, flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 14, backgroundColor: "#FFFFFF", borderWidth: 1, borderTopWidth: 0, borderColor: "#DFE8F0", borderBottomLeftRadius: 17, borderBottomRightRadius: 17 }, legend: { flexDirection: "row", alignItems: "center", gap: 5 }, legendDot: { width: 8, height: 8, borderRadius: 4 }, legendText: { color: "#687F96", fontSize: 10, lineHeight: 14, fontWeight: "700" }, source: { marginLeft: "auto", color: "#8799AA", fontSize: 9, lineHeight: 13, fontWeight: "600" },
  lessonPanel: { width: 370, padding: 18, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#DFE8F0", borderRadius: 22 }, eventHeader: { flexDirection: "row", gap: 11, alignItems: "flex-start" }, eventIcon: { width: 48, height: 48, borderRadius: 15, alignItems: "center", justifyContent: "center" }, eventHeaderText: { flex: 1 }, eventTag: { color: "#C34255", fontSize: 8, lineHeight: 12, letterSpacing: 0.7, fontWeight: "800" }, eventTitle: { color: "#1C3855", fontSize: 19, lineHeight: 24, fontWeight: "800", marginTop: 2 }, eventPlace: { color: "#6B8195", fontSize: 11, lineHeight: 15, fontWeight: "700", marginTop: 2 }, studentNotice: { flexDirection: "row", gap: 6, alignItems: "center", borderRadius: 11, padding: 9, backgroundColor: "#EAF5FE", marginTop: 12 }, studentNoticeText: { color: "#4F79A4", fontSize: 10, lineHeight: 14, fontWeight: "700" }, sectionLabel: { color: "#71879C", fontSize: 9, lineHeight: 13, letterSpacing: 0.8, fontWeight: "800", marginTop: 17, marginBottom: 8 }, levelRow: { flexDirection: "row", gap: 5, marginBottom: 10 }, levelButton: { flex: 1, minHeight: 30, alignItems: "center", justifyContent: "center", backgroundColor: "#EEF3F8", borderRadius: 9 }, levelButtonActive: { backgroundColor: "#2D8CDA" }, levelText: { color: "#60768D", fontSize: 10, lineHeight: 14, fontWeight: "800" }, levelTextActive: { color: "#FFFFFF" }, explanation: { color: "#405872", fontSize: 12, lineHeight: 19, fontWeight: "600" }, aiButton: { minHeight: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 7, backgroundColor: "#5A4CC7", marginTop: 12 }, aiButtonDisabled: { opacity: 0.6 }, aiButtonText: { color: "#FFFFFF", fontSize: 11, lineHeight: 15, fontWeight: "800" }, aiNote: { color: "#8A9CAD", fontSize: 9, lineHeight: 13, textAlign: "center", fontWeight: "600", marginTop: 7 }, aiError: { color: "#C34255", fontSize: 9, lineHeight: 13, textAlign: "center", fontWeight: "700", marginTop: 5 }, bulletGroup: { marginTop: 7 }, bulletHead: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 3 }, bulletTitle: { color: "#324C66", fontSize: 11, lineHeight: 15, fontWeight: "800" }, bulletRow: { flexDirection: "row", gap: 7, alignItems: "flex-start", marginTop: 3 }, bullet: { width: 5, height: 5, borderRadius: 3, marginTop: 6 }, bulletText: { color: "#6D8296", fontSize: 10, lineHeight: 15, fontWeight: "600", flex: 1 }, sourceBox: { marginTop: 13, padding: 10, borderRadius: 11, backgroundColor: "#F2F7FB", flexDirection: "row", gap: 8 }, sourceCopy: { flex: 1 }, sourceTitle: { color: "#4D6781", fontSize: 10, lineHeight: 14, fontWeight: "800" }, sourceDescription: { color: "#7890A5", fontSize: 9, lineHeight: 13, fontWeight: "600", marginTop: 1 },
  tools: { marginTop: 24 }, toolsHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }, toolsTitle: { color: "#1E3D5A", fontSize: 19, lineHeight: 25, fontWeight: "800" }, toolsSubtitle: { color: "#768B9F", fontSize: 11, lineHeight: 16, fontWeight: "600", marginTop: 1 }, toolGrid: { flexDirection: "row", gap: 13 }, toolCard: { flex: 1, minHeight: 180, padding: 13, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#DFE8F0", borderRadius: 18 }, cardLabel: { color: "#7A90A5", fontSize: 8, lineHeight: 12, letterSpacing: 0.75, fontWeight: "800" }, row: { minHeight: 43, flexDirection: "row", alignItems: "center", gap: 8, borderBottomWidth: 1, borderBottomColor: "#EEF2F6", paddingVertical: 7 }, rowSelected: { backgroundColor: "#EDF7FF", borderRadius: 9, paddingHorizontal: 4 }, rowIcon: { width: 29, height: 29, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#EAF5FE" }, rowCopy: { flex: 1, minWidth: 0 }, rowTitle: { color: "#37516B", fontSize: 11, lineHeight: 15, fontWeight: "800" }, rowMeta: { color: "#8194A7", fontSize: 9, lineHeight: 13, fontWeight: "600", marginTop: 1 }, signal: { width: 8, height: 8, borderRadius: 4 }, settingRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: "#EEF2F6" }, toggle: { width: 42, height: 24, borderRadius: 12, padding: 3, backgroundColor: "#D7E0EA", justifyContent: "center" }, toggleActive: { alignItems: "flex-end", backgroundColor: "#2D8CDA" }, toggleCircle: { width: 18, height: 18, borderRadius: 9, backgroundColor: "#FFFFFF" }, toggleCircleActive: { backgroundColor: "#FFFFFF" }, studentCountRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10, marginBottom: 4 }, count: { minWidth: 20, height: 20, borderRadius: 10, lineHeight: 20, textAlign: "center", color: "#2D8CDA", backgroundColor: "#EAF5FE", fontSize: 10, fontWeight: "800" }, studentRow: { flexDirection: "row", alignItems: "center", gap: 7, paddingVertical: 5 }, studentAvatar: { width: 25, height: 25, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: "#E7F0F8" }, studentAvatarText: { color: "#52718D", fontSize: 10, lineHeight: 13, fontWeight: "800" },
  studentView: { marginTop: 24 }, studentHero: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20, backgroundColor: "#0D2344", borderRadius: 20 }, studentTitle: { color: "#FFFFFF", fontSize: 19, lineHeight: 25, fontWeight: "800", marginTop: 3 }, studentCopy: { color: "#C3D8E9", fontSize: 12, lineHeight: 18, fontWeight: "600", marginTop: 2 }, studentHeroIcon: { width: 60, height: 60, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "#2D8CDA" }, questionCard: { padding: 16, backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#DFE8F0", marginTop: 12 }, questionTitle: { color: "#324D68", fontSize: 16, lineHeight: 22, fontWeight: "800", marginTop: 4 }, questionCopy: { color: "#71879C", fontSize: 11, lineHeight: 17, fontWeight: "600", marginTop: 5 }, disclaimer: { marginTop: 18, padding: 11, borderRadius: 14, backgroundColor: "#EAF5FE", flexDirection: "row", alignItems: "center", gap: 8 }, disclaimerText: { color: "#4A74A0", fontSize: 10, lineHeight: 15, fontWeight: "600", flex: 1 },
  modalOverlay: { flex: 1, alignItems: "center", justifyContent: "center", padding: 18, backgroundColor: "rgba(9,25,48,0.42)" }, modalCard: { width: "100%", maxWidth: 430, padding: 19, borderRadius: 21, backgroundColor: "#FFFFFF" }, modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 13 }, modalTitle: { color: "#1D3B58", fontSize: 20, lineHeight: 26, fontWeight: "800" }, modalClose: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: "#EEF3F8" }, modalCloseText: { color: "#5D748B", fontSize: 22, lineHeight: 25, fontWeight: "500" }, field: { marginBottom: 12 }, fieldLabel: { color: "#49627C", fontSize: 11, lineHeight: 15, fontWeight: "800", marginBottom: 5 }, input: { minHeight: 43, paddingHorizontal: 11, borderRadius: 11, borderWidth: 1, borderColor: "#D7E3ED", color: "#263E59", fontSize: 13, lineHeight: 18, fontWeight: "600" }, submit: { minHeight: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#2D8CDA", marginTop: 4 }, submitText: { color: "#FFFFFF", fontSize: 13, lineHeight: 18, fontWeight: "800" }, pressed: { opacity: 0.74, transform: [{ scale: 0.98 }] },
});
