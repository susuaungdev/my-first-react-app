import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type ReactNode,
  type TouchEvent as ReactTouchEvent,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  Rnd,
} from "react-rnd";

import toast from "react-hot-toast";

import Sidebar from "../components/dashboard/Sidebar";

import {
  createResume,
  getResumeById,
  updateResume,
  type Resume,
  type ResumeCanvasData,
  type ResumeCanvasElement,
  type ResumeCanvasElementType,
  type ResumeCanvasPage,
  type ResumeTextAlign,
  type ResumeExperience,
  type ResumeEducation,
  type ResumeProject,
  type ResumeCustomSection,
} from "../services/resumeService";

/* =========================================================
   CONSTANTS
========================================================= */

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const MAX_HISTORY = 50;

const SAFE_MARGIN = 40;
const SNAP_THRESHOLD = 7;

const AUTO_SAVE_DELAY = 2500;
const LOCAL_DRAFT_DELAY = 900;
const LOCAL_DRAFT_KEY = "careerflow:studio:new-draft";

const FONT_OPTIONS = [
  { label: "Inter", value: "Inter, Arial, sans-serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Garamond", value: "Garamond, Georgia, serif" },
  { label: "Times New Roman", value: '"Times New Roman", serif' },
  { label: "Trebuchet", value: '"Trebuchet MS", Arial, sans-serif' },
  { label: "Verdana", value: "Verdana, Arial, sans-serif" },
  { label: "Tahoma", value: "Tahoma, Arial, sans-serif" },
];

const PRESET_COLORS = [
  "#0F172A",
  "#2563EB",
  "#4F46E5",
  "#7C3AED",
  "#BE123C",
  "#C2410C",
  "#0F766E",
  "#15803D",
  "#0891B2",
  "#475569",
];

const PAGE_PRESET_COLORS = [
  "#FFFFFF",
  "#F8FAFC",
  "#FFF7ED",
  "#F0FDFA",
  "#EFF6FF",
  "#FAF5FF",
];

const createId = () => {
  if (
    typeof crypto !== "undefined" &&
    "randomUUID" in crypto
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
};

/* =========================================================
   INITIAL ELEMENTS
========================================================= */

const makeInitialElements = (
  name: string
): ResumeCanvasElement[] => [
  {
    id: createId(),
    type: "text",
    x: 70,
    y: 70,
    width: 500,
    height: 64,
    rotation: 0,
    zIndex: 2,
    content: name || "Your Name",
    fontFamily: "Inter, Arial, sans-serif",
    fontSize: 34,
    fontWeight: 700,
    color: "#0F172A",
    backgroundColor: "transparent",
    textAlign: "left",
    lineHeight: 1.15,
    letterSpacing: 0,
    opacity: 1,
    locked: false,
    hidden: false,
  },
  {
    id: createId(),
    type: "text",
    x: 72,
    y: 140,
    width: 420,
    height: 40,
    rotation: 0,
    zIndex: 2,
    content: "Professional Title",
    fontFamily: "Inter, Arial, sans-serif",
    fontSize: 18,
    fontWeight: 500,
    color: "#2563EB",
    backgroundColor: "transparent",
    textAlign: "left",
    lineHeight: 1.3,
    letterSpacing: 0,
    opacity: 1,
    locked: false,
    hidden: false,
  },
  {
    id: createId(),
    type: "divider",
    x: 70,
    y: 205,
    width: 654,
    height: 4,
    rotation: 0,
    zIndex: 1,
    color: "#2563EB",
    backgroundColor: "#2563EB",
    borderRadius: 999,
    opacity: 1,
    locked: false,
    hidden: false,
  },
];

type HistoryState = {
  elements: ResumeCanvasElement[];
  pageBackground: string;
};

type AlignmentGuides = {
  vertical: number[];
  horizontal: number[];
};


type ResumeBlockKind =
  | "profile"
  | "contact"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "custom";

type ResumeContentState = {
  professionalTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  summary: string;
  skills: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  projects: ResumeProject[];
  customSections: ResumeCustomSection[];
};

const linkedKey = (
  kind: ResumeBlockKind,
  customId?: string
) =>
  kind === "custom" && customId
    ? `careerflow:custom:${customId}`
    : `careerflow:${kind}`;

const getLinkedMeta = (
  element: ResumeCanvasElement
): {
  kind: ResumeBlockKind;
  customId?: string;
} | null => {
  const value =
    element.customSectionId;

  if (
    !value ||
    !value.startsWith("careerflow:")
  ) {
    return null;
  }

  const parts = value.split(":");
  const kind = parts[1] as ResumeBlockKind;

  if (
    ![
      "profile",
      "contact",
      "summary",
      "experience",
      "education",
      "skills",
      "projects",
      "custom",
    ].includes(kind)
  ) {
    return null;
  }

  return {
    kind,
    customId:
      kind === "custom"
        ? parts.slice(2).join(":")
        : undefined,
  };
};

/* =========================================================
   PAGE
========================================================= */

function ResumeDesignStudio() {
  const navigate = useNavigate();
  const { id } = useParams();

  const editingResumeId = useMemo(() => {
    if (!id) {
      return null;
    }

    const parsed = Number(id);

    return Number.isInteger(parsed) && parsed > 0
      ? parsed
      : null;
  }, [id]);

  const isEditingExisting =
    editingResumeId !== null;

  const workspaceRef = useRef<HTMLDivElement | null>(null);

  const storedUser = localStorage.getItem("user");

  let user: {
    name?: string;
    email?: string;
  } | null = null;

  try {
    user = storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch {
    user = null;
  }

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<
    "elements" | "properties" | null
  >(null);

  const [resumeTitle, setResumeTitle] = useState(
    "My CareerFlow Resume"
  );


  const [
    contentEditorOpen,
    setContentEditorOpen,
  ] = useState(false);


  const [
    linkedEditor,
    setLinkedEditor,
  ] = useState<{
    kind: ResumeBlockKind;
    customId?: string;
  } | null>(null);

  const [
    resumeContent,
    setResumeContent,
  ] = useState<ResumeContentState>({
    professionalTitle: "Professional Title",
    email: user?.email || "",
    phone: "",
    location: "",
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
    summary: "",
    skills: "",
    experience: [],
    education: [],
    projects: [],
    customSections: [],
  });

  const [elements, setElements] = useState<
    ResumeCanvasElement[]
  >(() =>
    makeInitialElements(user?.name || "Your Name")
  );

  const [
    selectedElementId,
    setSelectedElementId,
  ] = useState<string | null>(null);

  const [pageBackground, setPageBackground] =
    useState("#FFFFFF");

  const [
    pages,
    setPages,
  ] = useState<ResumeCanvasPage[]>([]);

  const [
    activePageIndex,
    setActivePageIndex,
  ] = useState(0);

  const [saving, setSaving] = useState(false);

  const [
    saveStatus,
    setSaveStatus,
  ] = useState<
    "saved" | "unsaved" | "saving" | "error"
  >("saved");

  const [
    previewMode,
    setPreviewMode,
  ] = useState(false);

  const [
    templatePickerOpen,
    setTemplatePickerOpen,
  ] = useState(false);

  const lastSavedSignatureRef =
    useRef("");

  const saveTimerRef =
    useRef<number | null>(null);

  const draftTimerRef =
    useRef<number | null>(null);

  const baselineReadyRef =
    useRef(false);

  const restoringDraftRef =
    useRef(false);

  const [
    snappingEnabled,
    setSnappingEnabled,
  ] = useState(true);

  const [
    alignmentGuides,
    setAlignmentGuides,
  ] = useState<AlignmentGuides>({
    vertical: [],
    horizontal: [],
  });

  const [
    loadingResume,
    setLoadingResume,
  ] = useState(isEditingExisting);

  const [
    loadError,
    setLoadError,
  ] = useState("");

  const [
    loadedProfileImage,
    setLoadedProfileImage,
  ] = useState<string | null>(null);

  /*
   * fitScale keeps the A4 page inside the available workspace.
   * zoomMultiplier lets the user zoom in/out without losing the
   * responsive fit calculation.
   */
  const [fitScale, setFitScale] = useState(1);
  const [zoomMultiplier, setZoomMultiplier] = useState(1);

  const canvasScale = useMemo(
    () =>
      Math.min(
        1.5,
        Math.max(
          0.25,
          fitScale * zoomMultiplier
        )
      ),
    [fitScale, zoomMultiplier]
  );

  const workspaceScrollRef =
    useRef<HTMLDivElement | null>(null);

  const [past, setPast] = useState<HistoryState[]>([]);
  const [future, setFuture] = useState<HistoryState[]>([]);
  const historyLockRef = useRef(false);

  /* =========================================================
     EXISTING STUDIO RESUME
  ========================================================= */

  const parseJsonValue = <T,>(
    value: T | string | null | undefined,
    fallback: T
  ): T => {
    if (
      value === null ||
      value === undefined
    ) {
      return fallback;
    }

    if (typeof value !== "string") {
      return value;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  };

  const getProfessionalTitleFromElements = (
    loadedElements: ResumeCanvasElement[]
  ) => {
    const linkedProfile =
      loadedElements.find(
        (element) =>
          element.customSectionId ===
          "careerflow:profile"
      );

    if (linkedProfile?.content) {
      const lines =
        linkedProfile.content.split("\n");

      if (lines[1]?.trim()) {
        return lines[1].trim();
      }
    }

    const likelyTitle =
      loadedElements
        .filter(
          (element) =>
            element.type === "text" &&
            !element.customSectionId
        )
        .sort((a, b) => a.y - b.y)[1];

    return (
      likelyTitle?.content?.trim() ||
      "Professional Title"
    );
  };

  useEffect(() => {
    if (!isEditingExisting) {
      setLoadingResume(false);
      setLoadError("");
      return;
    }

    if (!editingResumeId) {
      setLoadError("Invalid resume ID.");
      setLoadingResume(false);
      return;
    }

    let cancelled = false;

    const loadExistingResume =
      async () => {
        try {
          setLoadingResume(true);
          setLoadError("");

          const response =
            await getResumeById(
              editingResumeId
            );

          if (cancelled) {
            return;
          }

          const resume: Resume =
            response.resume;

          if (
            resume.editor_mode !==
            "studio"
          ) {
            navigate(
              `/resumes/${resume.id}/edit`,
              {
                replace: true,
              }
            );

            return;
          }

          const loadedCanvas =
            parseJsonValue<
              ResumeCanvasData | null
            >(
              resume.canvas_data,
              null
            );

          const loadedExperience =
            parseJsonValue<
              ResumeExperience[]
            >(
              resume.experience,
              []
            );

          const loadedEducation =
            parseJsonValue<
              ResumeEducation[]
            >(
              resume.education,
              []
            );

          const loadedProjects =
            parseJsonValue<
              ResumeProject[]
            >(
              resume.projects,
              []
            );

          const loadedCustomSections =
            parseJsonValue<
              ResumeCustomSection[]
            >(
              resume.custom_sections,
              []
            );

          const loadedPages =
            Array.isArray(
              loadedCanvas?.pages
            ) &&
            loadedCanvas!.pages.length > 0
              ? loadedCanvas!.pages.map(
                  (page, index) => ({
                    id:
                      page.id ||
                      `page-${index + 1}`,
                    width:
                      page.width ||
                      A4_WIDTH,
                    height:
                      page.height ||
                      A4_HEIGHT,
                    backgroundColor:
                      page.backgroundColor ||
                      "#FFFFFF",
                    elements:
                      Array.isArray(
                        page.elements
                      )
                        ? page.elements.map(
                            (element) => ({
                              ...element,
                            })
                          )
                        : [],
                  })
                )
              : [
                  {
                    id: "page-1",
                    width: A4_WIDTH,
                    height: A4_HEIGHT,
                    backgroundColor:
                      "#FFFFFF",
                    elements:
                      makeInitialElements(
                        user?.name ||
                          "Your Name"
                      ),
                  },
                ];

          const firstPage =
            loadedPages[0];

          const loadedElements =
            firstPage.elements.map(
              (element) => ({
                ...element,
              })
            );

          setResumeTitle(
            resume.title ||
              "My CareerFlow Resume"
          );

          setPages(
            loadedPages
          );

          setActivePageIndex(0);

          setElements(
            loadedElements
          );

          setPageBackground(
            firstPage.backgroundColor ||
              "#FFFFFF"
          );

          setLoadedProfileImage(
            resume.profile_image ||
              null
          );

          setResumeContent({
            professionalTitle:
              getProfessionalTitleFromElements(
                loadedElements
              ),
            email:
              user?.email || "",
            phone:
              resume.phone || "",
            location:
              resume.location || "",
            linkedinUrl:
              resume.linkedin_url ||
              "",
            githubUrl:
              resume.github_url || "",
            portfolioUrl:
              resume.portfolio_url ||
              "",
            summary:
              resume.summary || "",
            skills:
              resume.skills || "",
            experience:
              loadedExperience,
            education:
              loadedEducation,
            projects:
              loadedProjects,
            customSections:
              loadedCustomSections,
          });

          setSelectedElementId(null);
          setPast([]);
          setFuture([]);
        } catch (error) {
          if (cancelled) {
            return;
          }

          console.error(
            "Failed to load Studio resume:",
            error
          );

          setLoadError(
            error instanceof Error
              ? error.message
              : "Failed to load resume."
          );
        } finally {
          if (!cancelled) {
            setLoadingResume(false);
          }
        }
      };

    void loadExistingResume();

    return () => {
      cancelled = true;
    };
  }, [
    editingResumeId,
    isEditingExisting,
    navigate,
  ]);

  useEffect(() => {
    if (isEditingExisting) {
      return;
    }

    const raw =
      localStorage.getItem(
        LOCAL_DRAFT_KEY
      );

    if (!raw) {
      return;
    }

    try {
      const draft =
        JSON.parse(raw) as {
          title?: string;
          content?: ResumeContentState;
          pages?: ResumeCanvasPage[];
          activePageIndex?: number;
        };

      if (
        !Array.isArray(
          draft.pages
        ) ||
        draft.pages.length === 0
      ) {
        return;
      }

      restoringDraftRef.current =
        true;

      const safeIndex =
        Math.max(
          0,
          Math.min(
            draft.activePageIndex ||
              0,
            draft.pages.length - 1
          )
        );

      const active =
        draft.pages[safeIndex];

      setResumeTitle(
        draft.title ||
          "My CareerFlow Resume"
      );

      if (draft.content) {
        setResumeContent(
          draft.content
        );
      }

      setPages(
        draft.pages.map(
          (page, index) => ({
            id:
              page.id ||
              `page-${index + 1}`,
            width:
              page.width ||
              A4_WIDTH,
            height:
              page.height ||
              A4_HEIGHT,
            backgroundColor:
              page.backgroundColor ||
              "#FFFFFF",
            elements:
              Array.isArray(
                page.elements
              )
                ? page.elements.map(
                    (element) => ({
                      ...element,
                    })
                  )
                : [],
          })
        )
      );

      setActivePageIndex(
        safeIndex
      );

      setElements(
        (active?.elements || []).map(
          (element) => ({
            ...element,
          })
        )
      );

      setPageBackground(
        active?.backgroundColor ||
          "#FFFFFF"
      );

      toast.success(
        "Your unsaved Studio draft was restored."
      );
    } catch (error) {
      console.error(
        "Failed to restore Studio draft:",
        error
      );

      localStorage.removeItem(
        LOCAL_DRAFT_KEY
      );
    } finally {
      window.setTimeout(() => {
        restoringDraftRef.current =
          false;
      }, 0);
    }
  }, [
    isEditingExisting,
  ]);

  useEffect(() => {
    if (
      isEditingExisting ||
      pages.length > 0
    ) {
      return;
    }

    setPages([
      {
        id: "page-1",
        width: A4_WIDTH,
        height: A4_HEIGHT,
        backgroundColor:
          pageBackground,
        elements:
          elements.map(
            (element) => ({
              ...element,
            })
          ),
      },
    ]);
  }, [
    isEditingExisting,
    pages.length,
  ]);

  /* =========================================================
     HISTORY
  ========================================================= */

  const snapshot = (): HistoryState => ({
    elements: elements.map((element) => ({
      ...element,
    })),
    pageBackground,
  });

  const pushHistory = () => {
    if (historyLockRef.current) {
      return;
    }

    const current = snapshot();

    setPast((items) => [
      ...items.slice(-(MAX_HISTORY - 1)),
      current,
    ]);

    setFuture([]);
  };

  const undo = () => {
    if (past.length === 0) {
      return;
    }

    const previous = past[past.length - 1];
    const current = snapshot();

    historyLockRef.current = true;

    setPast((items) => items.slice(0, -1));
    setFuture((items) => [
      current,
      ...items.slice(0, MAX_HISTORY - 1),
    ]);

    setElements(
      previous.elements.map((element) => ({
        ...element,
      }))
    );

    setPageBackground(previous.pageBackground);
    setSelectedElementId(null);

    window.setTimeout(() => {
      historyLockRef.current = false;
    }, 0);
  };

  const redo = () => {
    if (future.length === 0) {
      return;
    }

    const next = future[0];
    const current = snapshot();

    historyLockRef.current = true;

    setPast((items) => [
      ...items.slice(-(MAX_HISTORY - 1)),
      current,
    ]);

    setFuture((items) => items.slice(1));

    setElements(
      next.elements.map((element) => ({
        ...element,
      }))
    );

    setPageBackground(next.pageBackground);
    setSelectedElementId(null);

    window.setTimeout(() => {
      historyLockRef.current = false;
    }, 0);
  };

  /* =========================================================
     RESPONSIVE SCALE
  ========================================================= */

  useEffect(() => {
    const updateScale = () => {
      const container = workspaceRef.current;

      if (!container) {
        return;
      }

      const sidePadding =
        window.innerWidth < 640
          ? 20
          : window.innerWidth < 1024
          ? 32
          : 64;

      const availableWidth = Math.max(
        260,
        container.clientWidth - sidePadding
      );

      const nextScale = Math.min(
        1,
        availableWidth / A4_WIDTH
      );

      setFitScale(
        Number(nextScale.toFixed(4))
      );
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);

    if (workspaceRef.current) {
      observer.observe(workspaceRef.current);
    }

    window.addEventListener("resize", updateScale);

    return () => {
      observer.disconnect();
      window.removeEventListener(
        "resize",
        updateScale
      );
    };
  }, []);

  /* =========================================================
     SELECTED ELEMENT
  ========================================================= */

  const selectedElement = useMemo(
    () =>
      elements.find(
        (element) =>
          element.id === selectedElementId
      ) || null,
    [elements, selectedElementId]
  );

  /* =========================================================
     VIEW / SELECTION HELPERS
  ========================================================= */

  const zoomIn = () => {
    setZoomMultiplier((current) =>
      Math.min(2.5, current + 0.1)
    );
  };

  const zoomOut = () => {
    setZoomMultiplier((current) =>
      Math.max(0.4, current - 0.1)
    );
  };

  const fitPage = () => {
    setZoomMultiplier(1);
  };

  const focusElement = (
    element: ResumeCanvasElement
  ) => {
    const scroller =
      workspaceScrollRef.current;

    if (!scroller) {
      return;
    }

    const top =
      Math.max(
        0,
        element.y * canvasScale -
          scroller.clientHeight * 0.28
      );

    const elementCenterX =
      (element.x + element.width / 2) *
      canvasScale;

    const left =
      Math.max(
        0,
        elementCenterX -
          scroller.clientWidth / 2
      );

    scroller.scrollTo({
      top,
      left,
      behavior: "smooth",
    });
  };

  const selectElement = (
    id: string,
    focus = false
  ) => {
    setSelectedElementId(id);

    if (
      window.innerWidth < 1280
    ) {
      setMobilePanel("properties");
    }

    if (focus) {
      const element =
        elements.find(
          (item) => item.id === id
        );

      if (element) {
        window.requestAnimationFrame(
          () => focusElement(element)
        );
      }
    }
  };

  const clearSelection = () => {
    setSelectedElementId(null);
    clearAlignmentGuides();
  };

  const clearAlignmentGuides = () => {
    setAlignmentGuides({
      vertical: [],
      horizontal: [],
    });
  };

  const getElementSafety = (
    element: ResumeCanvasElement | null
  ) => {
    if (!element) {
      return {
        outsidePage: false,
        outsideSafeArea: false,
      };
    }

    const outsidePage =
      element.x < 0 ||
      element.y < 0 ||
      element.x + element.width >
        A4_WIDTH ||
      element.y + element.height >
        A4_HEIGHT;

    const outsideSafeArea =
      element.x < SAFE_MARGIN ||
      element.y < SAFE_MARGIN ||
      element.x + element.width >
        A4_WIDTH - SAFE_MARGIN ||
      element.y + element.height >
        A4_HEIGHT - SAFE_MARGIN;

    return {
      outsidePage,
      outsideSafeArea,
    };
  };

  const selectedSafety =
    getElementSafety(
      selectedElement
    );

  const getSnapResult = (
    element: ResumeCanvasElement,
    proposedX: number,
    proposedY: number
  ) => {
    if (!snappingEnabled) {
      return {
        x: proposedX,
        y: proposedY,
        vertical: [] as number[],
        horizontal: [] as number[],
      };
    }

    const width =
      element.width;
    const height =
      element.height;

    const otherElements =
      elements.filter(
        (item) =>
          item.id !== element.id &&
          !item.hidden
      );

    const verticalTargets = [
      SAFE_MARGIN,
      A4_WIDTH / 2,
      A4_WIDTH - SAFE_MARGIN,
    ];

    const horizontalTargets = [
      SAFE_MARGIN,
      A4_HEIGHT / 2,
      A4_HEIGHT - SAFE_MARGIN,
    ];

    for (
      const other of otherElements
    ) {
      verticalTargets.push(
        other.x,
        other.x +
          other.width / 2,
        other.x +
          other.width
      );

      horizontalTargets.push(
        other.y,
        other.y +
          other.height / 2,
        other.y +
          other.height
      );
    }

    const xPoints = [
      {
        value: proposedX,
        offset: 0,
      },
      {
        value:
          proposedX +
          width / 2,
        offset:
          width / 2,
      },
      {
        value:
          proposedX + width,
        offset: width,
      },
    ];

    const yPoints = [
      {
        value: proposedY,
        offset: 0,
      },
      {
        value:
          proposedY +
          height / 2,
        offset:
          height / 2,
      },
      {
        value:
          proposedY + height,
        offset: height,
      },
    ];

    let snappedX =
      proposedX;
    let snappedY =
      proposedY;

    let bestXDistance =
      SNAP_THRESHOLD + 1;
    let bestYDistance =
      SNAP_THRESHOLD + 1;

    let verticalGuide:
      number | null = null;
    let horizontalGuide:
      number | null = null;

    for (
      const point of xPoints
    ) {
      for (
        const target of verticalTargets
      ) {
        const distance =
          Math.abs(
            point.value -
              target
          );

        if (
          distance <=
            SNAP_THRESHOLD &&
          distance <
            bestXDistance
        ) {
          bestXDistance =
            distance;

          snappedX =
            target -
            point.offset;

          verticalGuide =
            target;
        }
      }
    }

    for (
      const point of yPoints
    ) {
      for (
        const target of horizontalTargets
      ) {
        const distance =
          Math.abs(
            point.value -
              target
          );

        if (
          distance <=
            SNAP_THRESHOLD &&
          distance <
            bestYDistance
        ) {
          bestYDistance =
            distance;

          snappedY =
            target -
            point.offset;

          horizontalGuide =
            target;
        }
      }
    }

    snappedX =
      Math.max(
        0,
        Math.min(
          A4_WIDTH - width,
          snappedX
        )
      );

    snappedY =
      Math.max(
        0,
        Math.min(
          A4_HEIGHT - height,
          snappedY
        )
      );

    return {
      x:
        Math.round(snappedX),
      y:
        Math.round(snappedY),
      vertical:
        verticalGuide === null
          ? []
          : [verticalGuide],
      horizontal:
        horizontalGuide === null
          ? []
          : [horizontalGuide],
    };
  };

  /* =========================================================
     MULTI-PAGE HELPERS
  ========================================================= */

  const currentPageSnapshot =
    (): ResumeCanvasPage => ({
      id:
        pages[activePageIndex]?.id ||
        `page-${activePageIndex + 1}`,
      width: A4_WIDTH,
      height: A4_HEIGHT,
      backgroundColor:
        pageBackground,
      elements:
        elements.map(
          (element) => ({
            ...element,
          })
        ),
    });

  const getCommittedPages = () => {
    const current =
      currentPageSnapshot();

    if (pages.length === 0) {
      return [current];
    }

    const next =
      pages.map(
        (page) => ({
          ...page,
          elements:
            page.elements.map(
              (element) => ({
                ...element,
              })
            ),
        })
      );

    next[activePageIndex] =
      current;

    return next;
  };

  const loadPageIntoEditor = (
    page: ResumeCanvasPage,
    index: number
  ) => {
    setActivePageIndex(index);

    setElements(
      page.elements.map(
        (element) => ({
          ...element,
        })
      )
    );

    setPageBackground(
      page.backgroundColor ||
        "#FFFFFF"
    );

    setSelectedElementId(null);
    clearAlignmentGuides();
    setPast([]);
    setFuture([]);

    window.requestAnimationFrame(
      () => {
        workspaceScrollRef.current?.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth",
        });
      }
    );
  };

  const switchPage = (
    index: number
  ) => {
    if (
      index < 0 ||
      index >= pages.length ||
      index === activePageIndex
    ) {
      return;
    }

    const committed =
      getCommittedPages();

    const target =
      committed[index];

    if (!target) {
      return;
    }

    setPages(committed);

    loadPageIntoEditor(
      target,
      index
    );
  };

  const addPage = () => {
    const committed =
      getCommittedPages();

    const newPage:
      ResumeCanvasPage = {
      id: createId(),
      width: A4_WIDTH,
      height: A4_HEIGHT,
      backgroundColor:
        "#FFFFFF",
      elements: [],
    };

    const nextPages = [
      ...committed,
      newPage,
    ];

    setPages(nextPages);

    loadPageIntoEditor(
      newPage,
      nextPages.length - 1
    );

    toast.success(
      `Page ${nextPages.length} added.`
    );
  };

  const duplicatePage = () => {
    const committed =
      getCommittedPages();

    const source =
      committed[activePageIndex];

    if (!source) {
      return;
    }

    const duplicate:
      ResumeCanvasPage = {
      ...source,
      id: createId(),
      elements:
        source.elements.map(
          (element) => ({
            ...element,
            id: createId(),
          })
        ),
    };

    const nextPages = [
      ...committed.slice(
        0,
        activePageIndex + 1
      ),
      duplicate,
      ...committed.slice(
        activePageIndex + 1
      ),
    ];

    setPages(nextPages);

    loadPageIntoEditor(
      duplicate,
      activePageIndex + 1
    );

    toast.success(
      "Page duplicated."
    );
  };

  const deletePage = () => {
    const committed =
      getCommittedPages();

    if (
      committed.length <= 1
    ) {
      toast.error(
        "A resume must have at least one page."
      );

      return;
    }

    const nextPages =
      committed.filter(
        (_page, index) =>
          index !== activePageIndex
      );

    const nextIndex =
      Math.min(
        activePageIndex,
        nextPages.length - 1
      );

    const nextPage =
      nextPages[nextIndex];

    setPages(nextPages);

    loadPageIntoEditor(
      nextPage,
      nextIndex
    );

    toast.success(
      "Page deleted."
    );
  };

  /* =========================================================
     LINKED RESUME CONTENT
  ========================================================= */

  const getBlockContent = (
    kind: ResumeBlockKind,
    customId?: string
  ) => {
    if (kind === "profile") {
      return `${user?.name || "Your Name"}\n${
        resumeContent.professionalTitle ||
        "Professional Title"
      }`;
    }

    if (kind === "contact") {
      return [
        resumeContent.email,
        resumeContent.phone,
        resumeContent.location,
        resumeContent.linkedinUrl,
        resumeContent.githubUrl,
        resumeContent.portfolioUrl,
      ]
        .filter(Boolean)
        .join("  •  ") || "Add contact information";
    }

    if (kind === "summary") {
      return `PROFILE\n${
        resumeContent.summary ||
        "Add a short professional summary."
      }`;
    }

    if (kind === "skills") {
      return `SKILLS\n${
        resumeContent.skills ||
        "Add your skills."
      }`;
    }

    if (kind === "experience") {
      const body =
        resumeContent.experience.length > 0
          ? resumeContent.experience
              .map((item) => {
                const title = [
                  item.job_title,
                  item.company,
                ]
                  .filter(Boolean)
                  .join(" — ");

                const dates = [
                  item.start_date,
                  item.currently_working
                    ? "Present"
                    : item.end_date,
                ]
                  .filter(Boolean)
                  .join(" — ");

                return [
                  title,
                  dates,
                  item.description,
                ]
                  .filter(Boolean)
                  .join("\n");
              })
              .join("\n\n")
          : "Add your work experience.";

      return `EXPERIENCE\n${body}`;
    }

    if (kind === "education") {
      const body =
        resumeContent.education.length > 0
          ? resumeContent.education
              .map((item) => {
                const degree = [
                  item.degree,
                  item.field_of_study,
                ]
                  .filter(Boolean)
                  .join(" · ");

                const dates = [
                  item.start_date,
                  item.end_date,
                ]
                  .filter(Boolean)
                  .join(" — ");

                return [
                  item.school,
                  degree,
                  dates,
                ]
                  .filter(Boolean)
                  .join("\n");
              })
              .join("\n\n")
          : "Add your education.";

      return `EDUCATION\n${body}`;
    }

    if (kind === "projects") {
      const body =
        resumeContent.projects.length > 0
          ? resumeContent.projects
              .map((item) =>
                [
                  item.name,
                  item.description,
                  item.url,
                ]
                  .filter(Boolean)
                  .join("\n")
              )
              .join("\n\n")
          : "Add your projects.";

      return `PROJECTS\n${body}`;
    }

    const custom =
      resumeContent.customSections.find(
        (section) =>
          section.id === customId
      );

    return `${
      custom?.title ||
      "ADDITIONAL INFORMATION"
    }\n${
      custom?.content ||
      "Add custom information."
    }`;
  };

  const addResumeBlock = (
    kind: ResumeBlockKind,
    customId?: string
  ) => {
    const key =
      linkedKey(kind, customId);

    const existing =
      elements.find(
        (element) =>
          element.customSectionId === key
      );

    if (existing) {
      selectElement(existing.id, true);
      toast("That resume section is already on this page.");
      return;
    }

    pushHistory();

    const top =
      getTopZIndex() + 1;

    const isProfile =
      kind === "profile";

    const isContact =
      kind === "contact";

    const estimatedBlockHeight =
      isProfile
        ? 90
        : isContact
        ? 54
        : kind === "experience"
        ? 220
        : kind === "education" ||
          kind === "projects"
        ? 180
        : 130;

    const existingBottom =
      elements
        .filter(
          (element) =>
            !element.hidden &&
            !element.locked
        )
        .reduce(
          (bottom, element) =>
            Math.max(
              bottom,
              element.y +
                element.height
            ),
          SAFE_MARGIN
        );

    const suggestedY =
      Math.max(
        SAFE_MARGIN,
        Math.min(
          A4_HEIGHT -
            SAFE_MARGIN -
            estimatedBlockHeight,
          existingBottom + 24
        )
      );

    if (
      existingBottom +
        estimatedBlockHeight +
        24 >
      A4_HEIGHT - SAFE_MARGIN
    ) {
      toast(
        "This page is getting full. Consider adding another page."
      );
    }

    const next:
      ResumeCanvasElement = {
      id: createId(),
      type:
        isProfile || isContact
          ? "text"
          : "section",
      x:
        isProfile
          ? 70
          : isContact
          ? 70
          : 80,
      y:
        isProfile || isContact
          ? Math.min(
              suggestedY,
              180
            )
          : suggestedY,
      width:
        isProfile
          ? 470
          : isContact
          ? 620
          : 620,
      height:
        isProfile
          ? 90
          : isContact
          ? 54
          : kind === "experience"
          ? 260
          : kind === "education" ||
            kind === "projects"
          ? 210
          : 150,
      rotation: 0,
      zIndex: top,
      content:
        getBlockContent(
          kind,
          customId
        ),
      fontFamily:
        "Inter, Arial, sans-serif",
      fontSize:
        isProfile
          ? 28
          : isContact
          ? 12
          : 14,
      fontWeight:
        isProfile ? 700 : 400,
      color:
        isProfile
          ? "#0F172A"
          : kind === "contact"
          ? "#475569"
          : "#0F172A",
      backgroundColor:
        "transparent",
      textAlign: "left",
      lineHeight: 1.45,
      letterSpacing: 0,
      opacity: 1,
      borderRadius: 0,
      borderColor: "transparent",
      borderWidth: 0,
      borderStyle: "solid",
      locked: false,
      hidden: false,
      sectionType:
        kind === "summary" ||
        kind === "experience" ||
        kind === "education" ||
        kind === "skills" ||
        kind === "projects"
          ? kind
          : "custom",
      customSectionId: key,
    };

    setElements((current) => [
      ...current,
      next,
    ]);

    setSelectedElementId(next.id);

    if (
      window.innerWidth < 1280
    ) {
      setMobilePanel("properties");
    }
  };

  useEffect(() => {
    setElements((current) => {
      let changed = false;

      const next =
        current.map((element) => {
          const meta =
            getLinkedMeta(element);

          if (!meta) {
            return element;
          }

          const content =
            getBlockContent(
              meta.kind,
              meta.customId
            );

          if (
            content === element.content
          ) {
            return element;
          }

          changed = true;

          return {
            ...element,
            content,
          };
        });

      return changed
        ? next
        : current;
    });
  }, [
    resumeContent,
    user?.name,
  ]);

  useEffect(() => {
    setElements((current) => {
      let changed = false;

      const next =
        current.map((element) => {
          const meta =
            getLinkedMeta(element);

          if (
            !meta ||
            element.locked
          ) {
            return element;
          }

          const content =
            element.content || "";

          const fontSize =
            element.fontSize || 14;

          const approximateCharactersPerLine =
            Math.max(
              16,
              Math.floor(
                element.width /
                  Math.max(
                    6,
                    fontSize * 0.56
                  )
              )
            );

          const visualLineCount =
            content
              .split("\n")
              .reduce(
                (total, line) =>
                  total +
                  Math.max(
                    1,
                    Math.ceil(
                      Math.max(
                        line.length,
                        1
                      ) /
                        approximateCharactersPerLine
                    )
                  ),
                0
              );

          const estimatedHeight =
            Math.min(
              A4_HEIGHT -
                SAFE_MARGIN * 2,
              Math.max(
                meta.kind === "contact"
                  ? 42
                  : meta.kind === "profile"
                  ? 76
                  : 90,
                34 +
                  visualLineCount *
                    Math.max(
                      18,
                      fontSize *
                        (element.lineHeight ||
                          1.45)
                    )
              )
            );

          if (
            Math.abs(
              element.height -
                estimatedHeight
            ) < 2
          ) {
            return element;
          }

          changed = true;

          return {
            ...element,
            height:
              estimatedHeight,
          };
        });

      return changed
        ? next
        : current;
    });
  }, [
    resumeContent,
    user?.name,
  ]);

  const openLinkedEditorForElement = (
    element: ResumeCanvasElement
  ) => {
    const meta =
      getLinkedMeta(element);

    if (!meta) {
      return;
    }

    setLinkedEditor(meta);
  };

  /* =========================================================
     STARTER LAYOUTS
  ========================================================= */

  const applyStarterLayout = (
    layout:
      | "minimal"
      | "modern"
      | "executive"
      | "creative"
      | "two-column"
      | "photo"
  ) => {
    if (
      elements.length > 0 &&
      !window.confirm(
        "Apply this starter layout to the current page? Existing items on this page will be replaced."
      )
    ) {
      return;
    }

    pushHistory();

    const primary =
      layout === "creative"
        ? "#7C3AED"
        : layout === "executive"
        ? "#0F172A"
        : layout === "photo"
        ? "#0F766E"
        : "#2563EB";

    const makeLinked = (
      kind: ResumeBlockKind,
      x: number,
      y: number,
      width: number,
      height: number,
      fontSize = 14
    ): ResumeCanvasElement => ({
      id: createId(),
      type:
        kind === "profile" ||
        kind === "contact"
          ? "text"
          : "section",
      x,
      y,
      width,
      height,
      rotation: 0,
      zIndex: 5,
      content:
        getBlockContent(
          kind
        ),
      fontFamily:
        "Inter, Arial, sans-serif",
      fontSize,
      fontWeight:
        kind === "profile"
          ? 700
          : 400,
      color:
        kind === "contact"
          ? "#475569"
          : "#0F172A",
      backgroundColor:
        "transparent",
      textAlign: "left",
      lineHeight: 1.45,
      letterSpacing: 0,
      opacity: 1,
      borderRadius: 0,
      borderColor:
        "transparent",
      borderWidth: 0,
      borderStyle: "solid",
      locked: false,
      hidden: false,
      sectionType:
        kind === "summary" ||
        kind === "experience" ||
        kind === "education" ||
        kind === "skills" ||
        kind === "projects"
          ? kind
          : "custom",
      customSectionId:
        linkedKey(kind),
    });

    let next:
      ResumeCanvasElement[] = [];

    if (
      layout === "two-column" ||
      layout === "photo"
    ) {
      next = [
        {
          id: createId(),
          type: "shape",
          x: 0,
          y: 0,
          width: 250,
          height: A4_HEIGHT,
          rotation: 0,
          zIndex: 0,
          backgroundColor:
            layout === "photo"
              ? "#ECFDF5"
              : "#EFF6FF",
          color: primary,
          borderRadius: 0,
          opacity: 1,
          locked: true,
          hidden: false,
        },
        makeLinked(
          "profile",
          285,
          60,
          430,
          80,
          30
        ),
        makeLinked(
          "contact",
          36,
          250,
          175,
          150,
          11
        ),
        makeLinked(
          "skills",
          36,
          430,
          175,
          220,
          12
        ),
        makeLinked(
          "summary",
          285,
          170,
          430,
          130
        ),
        makeLinked(
          "experience",
          285,
          330,
          430,
          300
        ),
        makeLinked(
          "education",
          285,
          665,
          430,
          180
        ),
        makeLinked(
          "projects",
          285,
          875,
          430,
          170
        ),
      ];
    } else {
      const headerX =
        layout === "minimal"
          ? 70
          : 60;

      const contentWidth =
        layout === "minimal"
          ? 654
          : 674;

      next = [
        makeLinked(
          "profile",
          headerX,
          62,
          500,
          80,
          layout === "executive"
            ? 32
            : 30
        ),
        makeLinked(
          "contact",
          headerX,
          145,
          contentWidth,
          50,
          11
        ),
        {
          id: createId(),
          type: "divider",
          x: headerX,
          y: 205,
          width:
            contentWidth,
          height: 3,
          rotation: 0,
          zIndex: 1,
          color: primary,
          backgroundColor:
            primary,
          borderRadius: 999,
          opacity: 1,
          locked: false,
          hidden: false,
        },
        makeLinked(
          "summary",
          headerX,
          235,
          contentWidth,
          130
        ),
        makeLinked(
          "experience",
          headerX,
          390,
          contentWidth,
          300
        ),
        makeLinked(
          "education",
          headerX,
          720,
          contentWidth,
          170
        ),
        makeLinked(
          "skills",
          headerX,
          915,
          contentWidth,
          100
        ),
      ];

      if (
        layout === "modern" ||
        layout === "creative"
      ) {
        next.unshift({
          id: createId(),
          type: "shape",
          x: 0,
          y: 0,
          width: A4_WIDTH,
          height: 26,
          rotation: 0,
          zIndex: 0,
          backgroundColor:
            primary,
          color: primary,
          borderRadius: 0,
          opacity: 1,
          locked: true,
          hidden: false,
        });
      }
    }

    if (layout === "photo") {
      const firstPhoto =
        elements.find(
          (element) =>
            element.type ===
              "photo" &&
            element.imageSrc
        );

      next.push({
        id: createId(),
        type: "photo",
        x: 55,
        y: 65,
        width: 140,
        height: 140,
        rotation: 0,
        zIndex: 8,
        imageSrc:
          firstPhoto?.imageSrc ||
          loadedProfileImage ||
          "",
        objectFit: "cover",
        borderRadius: 999,
        borderColor:
          "#FFFFFF",
        borderWidth: 4,
        borderStyle: "solid",
        opacity: 1,
        locked: false,
        hidden: false,
      });
    }

    setElements(next);
    setPageBackground(
      "#FFFFFF"
    );
    setSelectedElementId(
      null
    );
    setTemplatePickerOpen(
      false
    );
    setSaveStatus(
      "unsaved"
    );

    toast.success(
      "Starter layout applied."
    );
  };

  /* =========================================================
     ELEMENT HELPERS
  ========================================================= */

  const getTopZIndex = () =>
    elements.reduce(
      (highest, element) =>
        Math.max(highest, element.zIndex),
      0
    );

  const addElement = (
    type: ResumeCanvasElementType
  ) => {
    pushHistory();

    const base: ResumeCanvasElement = {
      id: createId(),
      type,
      x: 110,
      y: 250 + elements.length * 12,
      width: 360,
      height: 70,
      rotation: 0,
      zIndex: getTopZIndex() + 1,
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: 18,
      fontWeight: 400,
      color: "#0F172A",
      backgroundColor: "transparent",
      textAlign: "left",
      lineHeight: 1.35,
      letterSpacing: 0,
      opacity: 1,
      borderRadius: 0,
      borderColor: "#CBD5E1",
      borderWidth: 0,
      borderStyle: "solid",
      locked: false,
      hidden: false,
    };

    let next = base;

    if (type === "text") {
      next = {
        ...base,
        content: "Add your text here",
        width: 420,
        height: 70,
      };
    }

    if (type === "section") {
      next = {
        ...base,
        content: "SECTION TITLE",
        width: 420,
        height: 54,
        fontSize: 16,
        fontWeight: 700,
        color: "#2563EB",
        letterSpacing: 1.2,
      };
    }

    if (type === "divider") {
      next = {
        ...base,
        width: 420,
        height: 4,
        color: "#2563EB",
        backgroundColor: "#2563EB",
        borderRadius: 999,
      };
    }

    if (type === "shape") {
      next = {
        ...base,
        width: 180,
        height: 120,
        backgroundColor: "#DBEAFE",
        borderColor: "#93C5FD",
        borderWidth: 1,
        borderRadius: 16,
      };
    }

    setElements((current) => [
      ...current,
      next,
    ]);

    setSelectedElementId(next.id);
    setMobilePanel("properties");
  };

  const updateElement = (
    id: string,
    patch: Partial<ResumeCanvasElement>,
    withHistory = true
  ) => {
    if (withHistory) {
      pushHistory();
    }

    setElements((current) =>
      current.map((element) =>
        element.id === id
          ? {
              ...element,
              ...patch,
            }
          : element
      )
    );
  };

  const deleteSelected = () => {
    if (!selectedElementId) {
      return;
    }

    pushHistory();

    setElements((current) =>
      current.filter(
        (element) =>
          element.id !== selectedElementId
      )
    );

    setSelectedElementId(null);
  };

  const duplicateSelected = () => {
    if (!selectedElement) {
      return;
    }

    pushHistory();

    const copy: ResumeCanvasElement = {
      ...selectedElement,
      id: createId(),
      x: selectedElement.x + 18,
      y: selectedElement.y + 18,
      zIndex: getTopZIndex() + 1,
    };

    setElements((current) => [
      ...current,
      copy,
    ]);

    setSelectedElementId(copy.id);
  };

  const bringForward = () => {
    if (!selectedElement) {
      return;
    }

    updateElement(selectedElement.id, {
      zIndex: getTopZIndex() + 1,
    });
  };

  const sendBackward = () => {
    if (!selectedElement) {
      return;
    }

    const bottom = elements.reduce(
      (lowest, element) =>
        Math.min(lowest, element.zIndex),
      0
    );

    updateElement(selectedElement.id, {
      zIndex: bottom - 1,
    });
  };

  /* =========================================================
     PHOTO
  ========================================================= */

  const handlePhotoUpload = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      ![
        "image/jpeg",
        "image/png",
        "image/webp",
      ].includes(file.type)
    ) {
      toast.error(
        "Please choose a JPG, PNG, or WebP image."
      );

      event.target.value = "";
      return;
    }

    if (
      file.size >
      1.5 * 1024 * 1024
    ) {
      toast.error(
        "Photo must be 1.5 MB or smaller."
      );

      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (
        typeof reader.result !== "string"
      ) {
        return;
      }

      pushHistory();

      const photo: ResumeCanvasElement = {
        id: createId(),
        type: "photo",
        x: 600,
        y: 60,
        width: 120,
        height: 120,
        rotation: 0,
        zIndex: getTopZIndex() + 1,
        imageSrc: reader.result,
        objectFit: "cover",
        borderRadius: 999,
        borderColor: "#FFFFFF",
        borderWidth: 0,
        borderStyle: "solid",
        opacity: 1,
        locked: false,
        hidden: false,
      };

      setElements((current) => [
        ...current,
        photo,
      ]);

      setSelectedElementId(photo.id);
      setMobilePanel("properties");

      toast.success(
        "Photo added to your resume."
      );
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  };

  /* =========================================================
     PAGE BACKGROUND
  ========================================================= */

  const changePageBackground = (
    color: string
  ) => {
    pushHistory();
    setPageBackground(color);
  };

  /* =========================================================
     KEYBOARD SHORTCUTS
  ========================================================= */

  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      const target =
        event.target as HTMLElement | null;

      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;

      const modifier =
        event.ctrlKey || event.metaKey;

      if (
        modifier &&
        event.key.toLowerCase() === "z"
      ) {
        event.preventDefault();

        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }

        return;
      }

      if (
        modifier &&
        event.key.toLowerCase() === "y"
      ) {
        event.preventDefault();
        redo();
        return;
      }

      if (isTyping) {
        return;
      }

      if (
        modifier &&
        event.key.toLowerCase() === "d" &&
        selectedElementId
      ) {
        event.preventDefault();
        duplicateSelected();
        return;
      }

      if (
        event.key === "Escape"
      ) {
        clearSelection();
        return;
      }

      if (
        selectedElement &&
        [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
        ].includes(event.key)
      ) {
        event.preventDefault();

        const amount =
          event.shiftKey ? 10 : 1;

        const patch:
          Partial<ResumeCanvasElement> = {};

        if (event.key === "ArrowUp") {
          patch.y = Math.max(
            0,
            selectedElement.y - amount
          );
        }

        if (event.key === "ArrowDown") {
          patch.y = Math.min(
            A4_HEIGHT -
              selectedElement.height,
            selectedElement.y + amount
          );
        }

        if (event.key === "ArrowLeft") {
          patch.x = Math.max(
            0,
            selectedElement.x - amount
          );
        }

        if (event.key === "ArrowRight") {
          patch.x = Math.min(
            A4_WIDTH -
              selectedElement.width,
            selectedElement.x + amount
          );
        }

        updateElement(
          selectedElement.id,
          patch
        );

        return;
      }

      if (
        (event.key === "Delete" ||
          event.key === "Backspace") &&
        selectedElementId
      ) {
        event.preventDefault();
        deleteSelected();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    selectedElementId,
    selectedElement,
    past,
    future,
    elements,
    pageBackground,
  ]);

  /* =========================================================
     SAVE / DRAFT STATE
  ========================================================= */

  const getDocumentSignature =
    () => {
      try {
        return JSON.stringify({
          title:
            resumeTitle.trim(),
          content:
            resumeContent,
          pages:
            getCommittedPages(),
        });
      } catch {
        return `${Date.now()}`;
      }
    };

  const markCurrentAsSaved =
    () => {
      lastSavedSignatureRef.current =
        getDocumentSignature();

      baselineReadyRef.current =
        true;

      setSaveStatus("saved");
    };

  useEffect(() => {
    if (loadingResume) {
      return;
    }

    const timer =
      window.setTimeout(() => {
        lastSavedSignatureRef.current =
          getDocumentSignature();

        baselineReadyRef.current =
          true;

        setSaveStatus(
          "saved"
        );
      }, 250);

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [
    loadingResume,
    editingResumeId,
  ]);

  useEffect(() => {
    if (
      !baselineReadyRef.current ||
      loadingResume ||
      restoringDraftRef.current
    ) {
      return;
    }

    const signature =
      getDocumentSignature();

    if (
      signature ===
      lastSavedSignatureRef.current
    ) {
      setSaveStatus(
        "saved"
      );
      return;
    }

    setSaveStatus(
      "unsaved"
    );
  }, [
    resumeTitle,
    resumeContent,
    elements,
    pageBackground,
    pages,
    activePageIndex,
    loadingResume,
  ]);

  useEffect(() => {
    const handleBeforeUnload = (
      event: BeforeUnloadEvent
    ) => {
      if (
        saveStatus !==
          "unsaved" &&
        saveStatus !==
          "saving"
      ) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );
    };
  }, [
    saveStatus,
  ]);

  const confirmLeaveStudio =
    () => {
      if (
        saveStatus ===
          "unsaved" ||
        saveStatus ===
          "saving"
      ) {
        return window.confirm(
          "You have unsaved changes. Leave Resume Studio anyway?"
        );
      }

      return true;
    };

  /* =========================================================
     SAVE
  ========================================================= */

  const buildCanvasData =
    (): ResumeCanvasData => {
      const committedPages =
        getCommittedPages();

      return {
        version: 1,
        pageSize: "A4",
        pages:
          committedPages.map(
            (page) => ({
              ...page,
              width:
                page.width ||
                A4_WIDTH,
              height:
                page.height ||
                A4_HEIGHT,
              elements:
                page.elements.map(
                  (element) => {
                    const meta =
                      getLinkedMeta(
                        element
                      );

                    return meta
                      ? {
                          ...element,
                          content:
                            getBlockContent(
                              meta.kind,
                              meta.customId
                            ),
                        }
                      : {
                          ...element,
                        };
                  }
                ),
            })
          ),
        selectedElementId: null,
      };
    };

  const saveResume = async (
    options: {
      silent?: boolean;
    } = {}
  ) => {
    if (!resumeTitle.trim()) {
      if (!options.silent) {
        toast.error(
          "Please enter a resume title."
        );
      }

      return false;
    }

    try {
      setSaving(true);
      setSaveStatus(
        "saving"
      );

      const canvasData =
        buildCanvasData();

      const firstPhoto =
        canvasData.pages
          .flatMap(
            (page) =>
              page.elements
          )
          .find(
            (element) =>
              element.type === "photo" &&
              element.imageSrc
          );

      const payload = {
        title:
          resumeTitle.trim(),
        summary:
          resumeContent.summary,
        phone:
          resumeContent.phone,
        location:
          resumeContent.location,
        linkedin_url:
          resumeContent.linkedinUrl,
        github_url:
          resumeContent.githubUrl,
        portfolio_url:
          resumeContent.portfolioUrl,
        skills:
          resumeContent.skills,
        experience:
          resumeContent.experience,
        education:
          resumeContent.education,
        projects:
          resumeContent.projects,
        template:
          "modern" as const,
        accent_color:
          "blue" as const,
        profile_image:
          firstPhoto?.imageSrc ||
          loadedProfileImage ||
          null,
        custom_sections:
          resumeContent.customSections,
        design_settings: {
          primary_color:
            "#2563EB",
          heading_color:
            "#0F172A",
          body_color:
            "#334155",
          background_color:
            pageBackground,
          font_family:
            "Inter, Arial, sans-serif",
          base_font_size:
            14,
          heading_scale:
            1,
          line_height:
            1.55,
          section_spacing:
            22,
          photo_shape:
            "circle" as const,
          hidden_sections:
            [],
        },
        section_order: [
          "summary",
          "experience",
          "education",
          "skills",
          "projects",
          ...resumeContent.customSections.map(
            (section) =>
              section.id
          ),
        ],
        editor_mode:
          "studio" as const,
        canvas_data:
          canvasData,
      };

      if (
        isEditingExisting &&
        editingResumeId
      ) {
        await updateResume(
          editingResumeId,
          payload
        );

        lastSavedSignatureRef.current =
          JSON.stringify({
            title:
              resumeTitle.trim(),
            content:
              resumeContent,
            pages:
              canvasData.pages,
          });

        baselineReadyRef.current =
          true;

        setSaveStatus(
          "saved"
        );

        setPast([]);
        setFuture([]);

        if (!options.silent) {
          toast.success(
            "Resume changes saved."
          );
        }

        return true;
      }

      const response =
        await createResume(
          payload
        );

      localStorage.removeItem(
        LOCAL_DRAFT_KEY
      );

      lastSavedSignatureRef.current =
        JSON.stringify({
          title:
            resumeTitle.trim(),
          content:
            resumeContent,
          pages:
            canvasData.pages,
        });

      baselineReadyRef.current =
        true;

      setSaveStatus(
        "saved"
      );

      if (!options.silent) {
        toast.success(
          "CareerFlow resume saved."
        );
      }

      navigate(
        `/resumes/${response.resumeId}/studio`,
        {
          replace: true,
        }
      );

      return true;
    } catch (error) {
      console.error(error);

      setSaveStatus(
        "error"
      );

      if (!options.silent) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to save resume."
        );
      }

      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    await saveResume();
  };

  /* =========================================================
     AUTO SAVE
  ========================================================= */

  useEffect(() => {
    if (
      !baselineReadyRef.current ||
      loadingResume ||
      saveStatus !==
        "unsaved"
    ) {
      return;
    }

    if (isEditingExisting) {
      if (
        saveTimerRef.current !==
        null
      ) {
        window.clearTimeout(
          saveTimerRef.current
        );
      }

      saveTimerRef.current =
        window.setTimeout(
          () => {
            void saveResume({
              silent: true,
            });
          },
          AUTO_SAVE_DELAY
        );

      return () => {
        if (
          saveTimerRef.current !==
          null
        ) {
          window.clearTimeout(
            saveTimerRef.current
          );
        }
      };
    }

    if (
      draftTimerRef.current !==
      null
    ) {
      window.clearTimeout(
        draftTimerRef.current
      );
    }

    draftTimerRef.current =
      window.setTimeout(
        () => {
          try {
            localStorage.setItem(
              LOCAL_DRAFT_KEY,
              JSON.stringify({
                title:
                  resumeTitle,
                content:
                  resumeContent,
                pages:
                  getCommittedPages(),
                activePageIndex,
              })
            );

            setSaveStatus(
              "saved"
            );

            lastSavedSignatureRef.current =
              getDocumentSignature();
          } catch (error) {
            console.error(
              "Failed to save local Studio draft:",
              error
            );

            setSaveStatus(
              "error"
            );
          }
        },
        LOCAL_DRAFT_DELAY
      );

    return () => {
      if (
        draftTimerRef.current !==
        null
      ) {
        window.clearTimeout(
          draftTimerRef.current
        );
      }
    };
  }, [
    saveStatus,
    isEditingExisting,
    loadingResume,
    resumeTitle,
    resumeContent,
    elements,
    pageBackground,
    pages,
    activePageIndex,
  ]);

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    if (!confirmLeaveStudio()) {
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  /* =========================================================
     PAGE
  ========================================================= */

  if (loadingResume) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="mt-4 text-sm font-semibold text-slate-700">
            Loading CareerFlow Resume Studio...
          </p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-bold text-slate-900">
            Could not open this resume
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {loadError}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/resumes")
            }
            className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Back to resumes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-100">
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-3 sm:px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700"
          aria-label="Open menu"
        >
          ☰
        </button>

        <div className="min-w-0 px-2 text-center">
          <p className="truncate text-sm font-bold text-slate-900">
            CareerFlow Resume Studio
          </p>
          <p className="text-[10px] text-slate-400">
            Page {activePageIndex + 1} of {Math.max(pages.length, 1)} · {saveStatus === "saving" ? "Saving..." : saveStatus === "unsaved" ? "Unsaved" : "Saved"}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
        >
          {saving
            ? "Saving..."
            : isEditingExisting
            ? "Save"
            : "Create"}
        </button>
      </header>

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      <div className="min-w-0 lg:ml-64 lg:h-screen lg:overflow-hidden">
        <div className="sticky top-0 z-40 hidden border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:block">
          <div className="mx-auto flex max-w-[1800px] items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (
                  confirmLeaveStudio()
                ) {
                  navigate(
                    "/resumes"
                  );
                }
              }}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              ← Back
            </button>

            <div className="min-w-0 flex-1">
              <input
                type="text"
                value={resumeTitle}
                onChange={(event) =>
                  setResumeTitle(event.target.value)
                }
                className="w-full max-w-md rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                placeholder="Resume title"
              />
            </div>

            <SaveStatusBadge
              status={
                saveStatus
              }
              isExisting={
                isEditingExisting
              }
            />

            <ToolbarButton
              onClick={undo}
              disabled={past.length === 0}
              title="Undo (Ctrl/Cmd + Z)"
            >
              ↶ Undo
            </ToolbarButton>

            <ToolbarButton
              onClick={redo}
              disabled={future.length === 0}
              title="Redo (Ctrl/Cmd + Shift + Z)"
            >
              ↷ Redo
            </ToolbarButton>

            <ToolbarButton
              onClick={() => {
                setPreviewMode(
                  (current) =>
                    !current
                );
                clearSelection();
              }}
              title="Preview the resume without editing guides"
            >
              {previewMode
                ? "Exit Preview"
                : "Preview"}
            </ToolbarButton>

            <ToolbarButton
              onClick={() =>
                setTemplatePickerOpen(
                  true
                )
              }
              title="Choose a Studio starter layout"
            >
              Layouts
            </ToolbarButton>

            <button
              type="button"
              onClick={() => {
                setSnappingEnabled(
                  (current) =>
                    !current
                );
                clearAlignmentGuides();
              }}
              className={`hidden rounded-xl border px-3 py-2 text-xs font-semibold transition xl:inline-flex ${
                snappingEnabled
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              }`}
              title="Snap elements to margins, center, and nearby items"
            >
              Snap {snappingEnabled ? "On" : "Off"}
            </button>

            <span className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500 xl:inline-flex">
              {Math.max(pages.length, 1)} {Math.max(pages.length, 1) === 1 ? "page" : "pages"}
            </span>

            <div className="hidden items-center overflow-hidden rounded-xl border border-slate-200 bg-white xl:flex">
              <button
                type="button"
                onClick={zoomOut}
                className="px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                title="Zoom out"
              >
                −
              </button>

              <button
                type="button"
                onClick={fitPage}
                className="min-w-[64px] border-x border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                title="Fit page"
              >
                {Math.round(canvasScale * 100)}%
              </button>

              <button
                type="button"
                onClick={zoomIn}
                className="px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                title="Zoom in"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : isEditingExisting
                ? "Save changes"
                : "Save resume"}
            </button>
          </div>
        </div>

        <div
          className={`grid min-h-[calc(100vh-64px)] grid-cols-1 xl:h-[calc(100vh-65px)] xl:min-h-0 ${
            previewMode
              ? "xl:grid-cols-[minmax(0,1fr)]"
              : "xl:grid-cols-[210px_minmax(0,1fr)_285px]"
          }`}
        >
          {!previewMode && (
          <aside className="hidden border-r border-slate-200 bg-white xl:block xl:overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="p-4">
              <ElementsPanel
                onAdd={addElement}
                onPhotoUpload={handlePhotoUpload}
                elements={elements}
                selectedElementId={selectedElementId}
                onSelectElement={(id) =>
                  selectElement(id, true)
                }
                onToggleHidden={(id) => {
                  const element =
                    elements.find(
                      (item) => item.id === id
                    );

                  if (!element) {
                    return;
                  }

                  updateElement(id, {
                    hidden: !element.hidden,
                  });
                }}
                onToggleLocked={(id) => {
                  const element =
                    elements.find(
                      (item) => item.id === id
                    );

                  if (!element) {
                    return;
                  }

                  updateElement(id, {
                    locked: !element.locked,
                  });
                }}
                onOpenContentEditor={() =>
                  setContentEditorOpen(true)
                }
                onAddResumeBlock={
                  addResumeBlock
                }
                customSections={
                  resumeContent.customSections
                }
                onOpenTemplates={() =>
                  setTemplatePickerOpen(
                    true
                  )
                }
              />
            </div>
          </aside>
          )}

          <main
            ref={workspaceRef}
            className="min-w-0 overflow-hidden bg-slate-200/70 xl:h-full"
          >
            <div className="border-b border-slate-200 bg-white p-4 lg:hidden">
              <label className="text-xs font-semibold text-slate-500">
                Resume title
              </label>

              <input
                type="text"
                value={resumeTitle}
                onChange={(event) =>
                  setResumeTitle(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
              />

              <div className="mt-3 grid grid-cols-2 gap-2">
                <ToolbarButton
                  onClick={undo}
                  disabled={past.length === 0}
                >
                  ↶ Undo
                </ToolbarButton>

                <ToolbarButton
                  onClick={redo}
                  disabled={future.length === 0}
                >
                  ↷ Redo
                </ToolbarButton>
              </div>
            </div>

            {!previewMode && (
            <PageToolbar
              pages={pages}
              activePageIndex={
                activePageIndex
              }
              onSelectPage={
                switchPage
              }
              onAddPage={
                addPage
              }
              onDuplicatePage={
                duplicatePage
              }
              onDeletePage={
                deletePage
              }
            />
            )}

            <div
              ref={workspaceScrollRef}
              className="min-h-[600px] overflow-auto px-2 py-4 pb-24 sm:px-4 sm:py-6 sm:pb-24 lg:px-6 lg:py-8 xl:h-full xl:min-h-0 xl:pb-8"
            >
              {!previewMode && (
              <div className="mx-auto mb-3 flex max-w-[794px] items-center justify-between gap-3">

                <div className="min-w-0">
                  {selectedElement &&
                  selectedSafety.outsidePage ? (
                    <p className="truncate rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                      This item is outside the page and may be cut off.
                    </p>
                  ) : selectedElement &&
                    selectedSafety.outsideSafeArea ? (
                    <p className="truncate rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                      This item is close to the edge. Keep important content inside the safe margin.
                    </p>
                  ) : selectedElement ? (
                    <p className="truncate text-xs font-medium text-slate-400">
                      Selected item is inside the recommended print area.
                    </p>
                  ) : (
                    <p className="truncate text-xs font-medium text-slate-400">
                      Keep important content inside the dashed safe margin.
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSnappingEnabled(
                      (current) =>
                        !current
                    );
                    clearAlignmentGuides();
                  }}
                  className={`shrink-0 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition xl:hidden ${
                    snappingEnabled
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-500"
                  }`}
                >
                  Snap {snappingEnabled ? "On" : "Off"}
                </button>

              </div>
              )}

              <div
                className="mx-auto"
                style={{
                  width: A4_WIDTH * canvasScale,
                  height: A4_HEIGHT * canvasScale,
                }}
              >
                <div
                  className="relative origin-top-left overflow-hidden shadow-2xl shadow-slate-400/30"
                  onMouseDown={(event) => {
                    if (
                      event.target ===
                      event.currentTarget
                    ) {
                      clearSelection();
                    }
                  }}
                  onDoubleClick={(event) => {
                    if (
                      event.target ===
                      event.currentTarget
                    ) {
                      clearSelection();
                    }
                  }}
                  style={{
                    width: A4_WIDTH,
                    height: A4_HEIGHT,
                    transform: `scale(${canvasScale})`,
                    backgroundColor: pageBackground,
                  }}
                >
                  {!previewMode && (
                  <div
                    className="pointer-events-none absolute border border-dashed border-slate-300"
                    style={{
                      left:
                        SAFE_MARGIN,
                      top:
                        SAFE_MARGIN,
                      right:
                        SAFE_MARGIN,
                      bottom:
                        SAFE_MARGIN,
                    }}
                  >
                    <span className="absolute -top-5 left-0 rounded bg-white/90 px-1.5 py-0.5 text-[9px] font-semibold text-slate-400">
                      Safe print area
                    </span>
                  </div>
                  )}

                  {!previewMode &&
                  alignmentGuides.vertical.map(
                    (position) => (
                      <div
                        key={`v-${position}`}
                        className="pointer-events-none absolute bottom-0 top-0 z-[9999] w-px bg-blue-500"
                        style={{
                          left:
                            position,
                        }}
                      />
                    )
                  )}

                  {!previewMode &&
                  alignmentGuides.horizontal.map(
                    (position) => (
                      <div
                        key={`h-${position}`}
                        className="pointer-events-none absolute left-0 right-0 z-[9999] h-px bg-blue-500"
                        style={{
                          top:
                            position,
                        }}
                      />
                    )
                  )}

                  {elements
                    .filter((element) => !element.hidden)
                    .map((element) => (
                      <CanvasElement
                        key={element.id}
                        element={element}
                        selected={
                          !previewMode &&
                          selectedElementId ===
                            element.id
                        }
                        previewMode={
                          previewMode
                        }
                        scale={canvasScale}
                        onSelect={() =>
                          selectElement(
                            element.id
                          )
                        }
                        onFocus={() =>
                          selectElement(
                            element.id,
                            true
                          )
                        }
                        onEditLinked={() =>
                          openLinkedEditorForElement(
                            element
                          )
                        }
                        onBeforeChange={pushHistory}
                        onDragMove={(x, y) => {
                          const snapped =
                            getSnapResult(
                              element,
                              x,
                              y
                            );

                          setAlignmentGuides({
                            vertical:
                              snapped.vertical,
                            horizontal:
                              snapped.horizontal,
                          });

                          updateElement(
                            element.id,
                            {
                              x:
                                snapped.x,
                              y:
                                snapped.y,
                            },
                            false
                          );
                        }}
                        onInteractionEnd={() =>
                          clearAlignmentGuides()
                        }
                        onChange={(patch) =>
                          updateElement(
                            element.id,
                            patch,
                            false
                          )
                        }
                      />
                    ))}
                </div>
              </div>
            </div>
          </main>

          {!previewMode && (
          <aside className="hidden border-l border-slate-200 bg-white xl:block xl:overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="p-4">
              <PropertiesPanel
                selectedElement={selectedElement}
                pageBackground={pageBackground}
                onPageBackgroundChange={
                  changePageBackground
                }
                onElementChange={(patch) => {
                  if (!selectedElement) {
                    return;
                  }

                  updateElement(
                    selectedElement.id,
                    patch
                  );
                }}
                onDelete={deleteSelected}
                onDuplicate={duplicateSelected}
                onBringForward={bringForward}
                onSendBackward={sendBackward}
                onFocusSelected={() => {
                  if (selectedElement) {
                    focusElement(
                      selectedElement
                    );
                  }
                }}
              />
            </div>
          </aside>
          )}
        </div>
      </div>

      {/* MOBILE BOTTOM BAR */}

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white p-2 xl:hidden">
        <div className="mx-auto grid max-w-xl grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => {
              if (previewMode) {
                return;
              }

              setMobilePanel(
                mobilePanel === "elements"
                  ? null
                  : "elements"
              );
            }}
            className={`rounded-xl px-3 py-3 text-xs font-semibold transition ${
              mobilePanel === "elements"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            + Add
          </button>

          <button
            type="button"
            onClick={() => {
              if (previewMode) {
                return;
              }

              setMobilePanel(
                mobilePanel === "properties"
                  ? null
                  : "properties"
              );
            }}
            className={`rounded-xl px-3 py-3 text-xs font-semibold transition ${
              mobilePanel === "properties"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => {
              setPreviewMode(
                (current) =>
                  !current
              );
              setMobilePanel(
                null
              );
              clearSelection();
            }}
            className={`rounded-xl px-3 py-3 text-xs font-semibold transition ${
              previewMode
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {previewMode
              ? "Edit"
              : "Preview"}
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-slate-900 px-3 py-3 text-xs font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}

      {mobilePanel && (
        <div className="fixed inset-0 z-[60] xl:hidden">
          <button
            type="button"
            aria-label="Close panel"
            onClick={() => setMobilePanel(null)}
            className="absolute inset-0 bg-slate-950/30"
          />

          <div className="absolute inset-x-0 bottom-0 max-h-[78vh] overflow-y-auto rounded-t-3xl bg-white p-4 shadow-2xl">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />

            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-slate-900">
                {mobilePanel === "elements"
                  ? "Add content"
                  : selectedElement
                  ? "Edit item"
                  : "Page settings"}
              </h2>

              <button
                type="button"
                onClick={() => setMobilePanel(null)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600"
              >
                Close
              </button>
            </div>

            {mobilePanel === "elements" ? (
              <ElementsPanel
                onAdd={addElement}
                onPhotoUpload={handlePhotoUpload}
                elements={elements}
                selectedElementId={selectedElementId}
                onSelectElement={(id) =>
                  selectElement(id, true)
                }
                onToggleHidden={(id) => {
                  const element =
                    elements.find(
                      (item) => item.id === id
                    );

                  if (element) {
                    updateElement(id, {
                      hidden: !element.hidden,
                    });
                  }
                }}
                onToggleLocked={(id) => {
                  const element =
                    elements.find(
                      (item) => item.id === id
                    );

                  if (element) {
                    updateElement(id, {
                      locked: !element.locked,
                    });
                  }
                }}
                onOpenContentEditor={() =>
                  setContentEditorOpen(true)
                }
                onAddResumeBlock={
                  addResumeBlock
                }
                customSections={
                  resumeContent.customSections
                }
                onOpenTemplates={() =>
                  setTemplatePickerOpen(
                    true
                  )
                }
              />
            ) : (
              <PropertiesPanel
                selectedElement={selectedElement}
                pageBackground={pageBackground}
                onPageBackgroundChange={
                  changePageBackground
                }
                onElementChange={(patch) => {
                  if (!selectedElement) {
                    return;
                  }

                  updateElement(
                    selectedElement.id,
                    patch
                  );
                }}
                onDelete={deleteSelected}
                onDuplicate={duplicateSelected}
                onBringForward={bringForward}
                onSendBackward={sendBackward}
                onFocusSelected={() => {
                  if (selectedElement) {
                    focusElement(
                      selectedElement
                    );
                  }
                }}
              />
            )}
          </div>
        </div>
      )}

      <ResumeContentEditor
        open={contentEditorOpen}
        value={resumeContent}
        onChange={setResumeContent}
        onClose={() =>
          setContentEditorOpen(false)
        }
      />

      <LinkedBlockEditor
        editor={linkedEditor}
        value={resumeContent}
        onChange={setResumeContent}
        onClose={() =>
          setLinkedEditor(null)
        }
      />

      <StudioLayoutPicker
        open={
          templatePickerOpen
        }
        onClose={() =>
          setTemplatePickerOpen(
            false
          )
        }
        onSelect={
          applyStarterLayout
        }
      />
    </div>
  );
}

/* =========================================================
   SAVE STATUS
========================================================= */

function SaveStatusBadge({
  status,
  isExisting,
}: {
  status:
    | "saved"
    | "unsaved"
    | "saving"
    | "error";
  isExisting: boolean;
}) {
  const label =
    status === "saving"
      ? "Saving..."
      : status === "unsaved"
      ? "Unsaved changes"
      : status === "error"
      ? "Save problem"
      : isExisting
      ? "Saved"
      : "Draft saved";

  return (
    <span
      className={`hidden rounded-full px-3 py-1.5 text-xs font-semibold lg:inline-flex ${
        status === "saving"
          ? "bg-blue-50 text-blue-700"
          : status === "unsaved"
          ? "bg-amber-50 text-amber-700"
          : status === "error"
          ? "bg-red-50 text-red-700"
          : "bg-emerald-50 text-emerald-700"
      }`}
    >
      {label}
    </span>
  );
}

/* =========================================================
   STUDIO STARTER LAYOUTS
========================================================= */

function StudioLayoutPicker({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (
    layout:
      | "minimal"
      | "modern"
      | "executive"
      | "creative"
      | "two-column"
      | "photo"
  ) => void;
}) {
  if (!open) {
    return null;
  }

  const options = [
    {
      id: "minimal" as const,
      name: "Minimal",
      description:
        "Simple, clean and ATS-friendly.",
    },
    {
      id: "modern" as const,
      name: "Modern",
      description:
        "Clean header with a stronger visual accent.",
    },
    {
      id: "executive" as const,
      name: "Executive",
      description:
        "Professional layout for experienced candidates.",
    },
    {
      id: "creative" as const,
      name: "Creative",
      description:
        "More personality while staying readable.",
    },
    {
      id: "two-column" as const,
      name: "Two Column",
      description:
        "Compact sidebar layout for detailed resumes.",
    },
    {
      id: "photo" as const,
      name: "Photo Resume",
      description:
        "Two-column layout designed for a profile image.",
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/40 p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close layouts"
        onClick={onClose}
        className="absolute inset-0"
      />

      <div className="relative z-10 max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-600">
              CareerFlow
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Choose a starter layout
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              You can move and customize everything after applying a layout.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="grid max-h-[calc(92vh-90px)] grid-cols-1 gap-3 overflow-y-auto p-5 sm:grid-cols-2">
          {options.map(
            (option) => (
              <button
                key={option.id}
                type="button"
                onClick={() =>
                  onSelect(
                    option.id
                  )
                }
                className="rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-blue-300 hover:bg-blue-50/40"
              >
                <div className="mb-4 h-32 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="h-full rounded-lg bg-white p-3 shadow-sm">
                    <div className="h-2 w-20 rounded bg-slate-800" />
                    <div className="mt-2 h-1.5 w-14 rounded bg-blue-500" />
                    <div className="mt-4 h-px w-full bg-slate-200" />
                    <div className="mt-3 space-y-2">
                      <div className="h-1.5 w-full rounded bg-slate-200" />
                      <div className="h-1.5 w-4/5 rounded bg-slate-200" />
                      <div className="h-1.5 w-3/5 rounded bg-slate-200" />
                    </div>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900">
                  {option.name}
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {option.description}
                </p>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE TOOLBAR
========================================================= */

function PageToolbar({
  pages,
  activePageIndex,
  onSelectPage,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
}: {
  pages: ResumeCanvasPage[];
  activePageIndex: number;
  onSelectPage: (
    index: number
  ) => void;
  onAddPage: () => void;
  onDuplicatePage: () => void;
  onDeletePage: () => void;
}) {
  const pageCount =
    Math.max(
      pages.length,
      1
    );

  return (
    <div className="border-b border-slate-200 bg-white px-3 py-3 sm:px-4">

      <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

        <div className="flex min-w-0 items-center gap-2">

          {Array.from({
            length:
              pageCount,
          }).map(
            (_item, index) => (
              <button
                key={
                  pages[index]?.id ||
                  index
                }
                type="button"
                onClick={() =>
                  onSelectPage(
                    index
                  )
                }
                className={`shrink-0 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  activePageIndex ===
                  index
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Page {index + 1}
              </button>
            )
          )}

        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">

          <button
            type="button"
            onClick={
              onAddPage
            }
            className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            + Add page
          </button>

          <button
            type="button"
            onClick={
              onDuplicatePage
            }
            className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 sm:inline-flex"
          >
            Duplicate
          </button>

          <button
            type="button"
            onClick={
              onDeletePage
            }
            disabled={
              pageCount <= 1
            }
            className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 sm:inline-flex"
          >
            Delete
          </button>

        </div>

      </div>

      <div className="mt-2 flex items-center justify-between gap-3 sm:hidden">

        <p className="text-[11px] text-slate-400">
          Page {activePageIndex + 1} of {pageCount}
        </p>

        <div className="flex gap-2">

          <button
            type="button"
            onClick={
              onDuplicatePage
            }
            className="text-[11px] font-semibold text-slate-500"
          >
            Duplicate
          </button>

          <button
            type="button"
            onClick={
              onDeletePage
            }
            disabled={
              pageCount <= 1
            }
            className="text-[11px] font-semibold text-red-500 disabled:opacity-30"
          >
            Delete
          </button>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   ELEMENTS PANEL
========================================================= */

function ElementsPanel({
  onAdd,
  onPhotoUpload,
  elements,
  selectedElementId,
  onSelectElement,
  onToggleHidden,
  onToggleLocked,
  onOpenContentEditor,
  onAddResumeBlock,
  customSections,
  onOpenTemplates,
}: {
  onAdd: (type: ResumeCanvasElementType) => void;
  onPhotoUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  elements: ResumeCanvasElement[];
  selectedElementId: string | null;
  onSelectElement: (id: string) => void;
  onToggleHidden: (id: string) => void;
  onToggleLocked: (id: string) => void;
  onOpenContentEditor: () => void;
  onAddResumeBlock: (
    kind: ResumeBlockKind,
    customId?: string
  ) => void;
  customSections: ResumeCustomSection[];
  onOpenTemplates: () => void;
}) {
  const [showItems, setShowItems] = useState(false);

  return (
    <div>
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
          CareerFlow
        </p>
        <h2 className="mt-1 text-lg font-bold text-slate-900">Add content</h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Choose what you want to place on your resume.
        </p>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-2">
        <button
          type="button"
          onClick={onOpenContentEditor}
          className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Edit resume information
        </button>

        <button
          type="button"
          onClick={onOpenTemplates}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          Choose starter layout
        </button>
      </div>

      <div className="mb-5">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
          Resume sections
        </p>

        <div className="grid grid-cols-2 gap-2 xl:grid-cols-1">
          <ResumeBlockButton
            label="Profile"
            icon="P"
            onClick={() =>
              onAddResumeBlock("profile")
            }
          />
          <ResumeBlockButton
            label="Contact"
            icon="@"
            onClick={() =>
              onAddResumeBlock("contact")
            }
          />
          <ResumeBlockButton
            label="Summary"
            icon="S"
            onClick={() =>
              onAddResumeBlock("summary")
            }
          />
          <ResumeBlockButton
            label="Experience"
            icon="E"
            onClick={() =>
              onAddResumeBlock("experience")
            }
          />
          <ResumeBlockButton
            label="Education"
            icon="Ed"
            onClick={() =>
              onAddResumeBlock("education")
            }
          />
          <ResumeBlockButton
            label="Skills"
            icon="Sk"
            onClick={() =>
              onAddResumeBlock("skills")
            }
          />
          <ResumeBlockButton
            label="Projects"
            icon="Pr"
            onClick={() =>
              onAddResumeBlock("projects")
            }
          />
        </div>

        {customSections.length > 0 && (
          <div className="mt-2 space-y-2">
            {customSections.map(
              (section) => (
                <ResumeBlockButton
                  key={section.id}
                  label={
                    section.title ||
                    "Custom section"
                  }
                  icon="+"
                  onClick={() =>
                    onAddResumeBlock(
                      "custom",
                      section.id
                    )
                  }
                />
              )
            )}
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 pt-4">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
          Design elements
        </p>

        <div className="space-y-2">
        <ToolButton label="Text" icon="T" onClick={() => onAdd("text")} />
        <ToolButton label="Heading" icon="H" onClick={() => onAdd("section")} />
        <ToolButton label="Divider" icon="—" onClick={() => onAdd("divider")} />
        <ToolButton label="Shape" icon="□" onClick={() => onAdd("shape")} />

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold">◉</span>
          <span>Photo</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onPhotoUpload} className="hidden" />
        </label>
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-blue-50 p-3">
        <p className="text-xs font-bold text-blue-800">Easy editing</p>
        <p className="mt-1 text-xs leading-5 text-blue-700/80">
          Add an item, select it on the resume, then edit it from the right side.
        </p>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => setShowItems((current) => !current)}
          className="flex w-full items-center justify-between rounded-xl px-1 py-2 text-left"
        >
          <span>
            <span className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Resume items</span>
            <span className="mt-0.5 block text-[11px] text-slate-400">{elements.length} items</span>
          </span>
          <span className="text-base text-slate-400">{showItems ? "−" : "+"}</span>
        </button>

        {showItems && (
          <div className="mt-2 space-y-2">
            {[...elements].sort((a,b) => b.zIndex - a.zIndex).map((element) => {
              const label =
                element.type === "text" || element.type === "section"
                  ? element.content?.trim() || "Text"
                  : element.type === "photo"
                  ? "Photo"
                  : element.type === "divider"
                  ? "Divider"
                  : "Shape";
              const active = selectedElementId === element.id;

              return (
                <div key={element.id} className={`rounded-xl border p-2 ${active ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white"}`}>
                  <button type="button" onClick={() => onSelectElement(element.id)} className="w-full truncate text-left text-xs font-semibold text-slate-700">
                    {label}
                  </button>
                  <div className="mt-2 flex gap-1">
                    <button type="button" onClick={() => onToggleHidden(element.id)} className="flex-1 rounded-lg bg-slate-50 px-2 py-1.5 text-[10px] font-semibold text-slate-500 hover:bg-slate-100">
                      {element.hidden ? "Show" : "Hide"}
                    </button>
                    <button type="button" onClick={() => onToggleLocked(element.id)} className="flex-1 rounded-lg bg-slate-50 px-2 py-1.5 text-[10px] font-semibold text-slate-500 hover:bg-slate-100">
                      {element.locked ? "Unlock" : "Lock"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   PROPERTIES PANEL
========================================================= */

function PropertiesPanel({
  selectedElement,
  pageBackground,
  onPageBackgroundChange,
  onElementChange,
  onDelete,
  onDuplicate,
  onBringForward,
  onSendBackward,
  onFocusSelected,
}: {
  selectedElement: ResumeCanvasElement | null;
  pageBackground: string;
  onPageBackgroundChange: (value: string) => void;
  onElementChange: (patch: Partial<ResumeCanvasElement>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onFocusSelected: () => void;
}) {
  const [tab, setTab] = useState<"style" | "position" | "more">("style");

  useEffect(() => {
    setTab("style");
  }, [selectedElement?.id]);

  if (!selectedElement) {
    return (
      <div>
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">Resume</p>
          <h2 className="mt-1 text-lg font-bold text-slate-900">Page style</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Select an item on the resume to edit it.
          </p>
        </div>
        <PageProperties backgroundColor={pageBackground} onBackgroundChange={onPageBackgroundChange} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">Editing</p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <h2 className="truncate text-lg font-bold capitalize text-slate-900">{selectedElement.type}</h2>
          <button type="button" onClick={onFocusSelected} className="rounded-lg border border-blue-200 px-2.5 py-1.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-50">Find</button>
        </div>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Changes apply only to the selected item.
        </p>
      </div>

      <ElementSafetyNotice
        element={
          selectedElement
        }
      />

      <div className="mb-5 grid grid-cols-3 rounded-xl bg-slate-100 p-1">
        {([["style","Style"],["position","Position"],["more","More"]] as const).map(([value,label]) => (
          <button key={value} type="button" onClick={() => setTab(value)} className={`rounded-lg px-2 py-2 text-xs font-semibold transition ${tab === value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
            {label}
          </button>
        ))}
      </div>

      <ElementProperties
        element={selectedElement}
        activeTab={tab}
        onChange={onElementChange}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onBringForward={onBringForward}
        onSendBackward={onSendBackward}
        onFocusSelected={onFocusSelected}
      />
    </div>
  );
}

/* =========================================================
   CANVAS ELEMENT
========================================================= */

function CanvasElement({
  element,
  selected,
  previewMode,
  scale,
  onSelect,
  onFocus,
  onEditLinked,
  onBeforeChange,
  onDragMove,
  onInteractionEnd,
  onChange,
}: {
  element: ResumeCanvasElement;
  selected: boolean;
  previewMode: boolean;
  scale: number;
  onSelect: () => void;
  onFocus: () => void;
  onEditLinked: () => void;
  onBeforeChange: () => void;
  onDragMove: (
    x: number,
    y: number
  ) => void;
  onInteractionEnd: () => void;
  onChange: (
    patch: Partial<ResumeCanvasElement>
  ) => void;
}) {
  const style: CSSProperties = {
    width: "100%",
    height: "100%",
    opacity: element.opacity ?? 1,
    transform: `rotate(${element.rotation || 0}deg)`,
    transformOrigin: "center",
    overflow: "hidden",
  };

  return (
    <Rnd
      bounds="parent"
      scale={scale}
      size={{
        width: element.width,
        height: element.height,
      }}
      position={{
        x: element.x,
        y: element.y,
      }}
      minWidth={
        element.type === "divider"
          ? 30
          : 40
      }
      minHeight={
        element.type === "divider"
          ? 2
          : 24
      }
      disableDragging={
        previewMode ||
        Boolean(
          element.locked
        )
      }
      enableResizing={
        previewMode ||
        element.locked
          ? false
          : true
      }
      onDragStart={(event) => {
        event.stopPropagation();
        onBeforeChange();
        onSelect();
      }}
      onDrag={(_event, data) => {
        onDragMove(
          data.x,
          data.y
        );
      }}
      onDragStop={(_event, data) => {
        onDragMove(
          data.x,
          data.y
        );
        onInteractionEnd();
      }}
      onResizeStart={(event) => {
        event.stopPropagation();
        onBeforeChange();
        onSelect();
      }}
      onResizeStop={(
        _event,
        _direction,
        ref,
        _delta,
        position
      ) => {
        onChange({
          width:
            Math.round(
              ref.offsetWidth
            ),
          height:
            Math.round(
              ref.offsetHeight
            ),
          x:
            Math.round(
              position.x
            ),
          y:
            Math.round(
              position.y
            ),
        });

        onInteractionEnd();
      }}
      style={{
        zIndex: element.zIndex,
        outline: selected
          ? "2px solid #2563EB"
          : "1px solid transparent",
        outlineOffset: selected
          ? "3px"
          : "0",
        boxShadow: selected
          ? "0 0 0 1px rgba(37,99,235,0.15)"
          : undefined,
      }}
      onMouseDown={(event) => {
        event.stopPropagation();

        if (!previewMode) {
          onSelect();
        }
      }}
      onTouchStart={(event: ReactTouchEvent<HTMLDivElement>) => {
        event.stopPropagation();

        if (!previewMode) {
          onSelect();
        }
      }}
    >
      <div
        style={style}
        onClick={(event) => {
          event.stopPropagation();

          if (!previewMode) {
            onSelect();
          }
        }}
        onDoubleClick={(event) => {
          event.stopPropagation();

          if (previewMode) {
            return;
          }

          if (
            getLinkedMeta(element)
          ) {
            onEditLinked();
            return;
          }

          onFocus();
        }}
        onTouchEnd={(event) => {
          event.stopPropagation();
        }}
      >
        {element.type === "section" &&
        getLinkedMeta(element) ? (
          <LinkedResumeBlock
            element={element}
          />
        ) : (element.type === "text" ||
          element.type === "section") && (
          <div
            className="h-full w-full whitespace-pre-wrap break-words"
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent:
                element.textAlign === "center"
                  ? "center"
                  : element.textAlign === "right"
                  ? "flex-end"
                  : "flex-start",
              fontFamily:
                element.fontFamily,
              fontSize: `${
                element.fontSize || 16
              }px`,
              fontWeight:
                element.fontWeight || 400,
              color:
                element.color ||
                "#0F172A",
              backgroundColor:
                element.backgroundColor &&
                element.backgroundColor !==
                  "transparent"
                  ? element.backgroundColor
                  : "transparent",
              textAlign:
                element.textAlign || "left",
              lineHeight:
                element.lineHeight || 1.35,
              letterSpacing: `${
                element.letterSpacing || 0
              }px`,
              borderRadius: `${
                element.borderRadius || 0
              }px`,
              border: `${
                element.borderWidth || 0
              }px ${
                element.borderStyle ||
                "solid"
              } ${
                element.borderColor ||
                "transparent"
              }`,
              padding: "4px",
            }}
          >
            {element.content || ""}
          </div>
        )}

        {element.type === "photo" && (
          <img
            src={element.imageSrc || ""}
            alt="Resume element"
            draggable={false}
            className="h-full w-full select-none"
            style={{
              objectFit:
                element.objectFit ||
                "cover",
              borderRadius: `${
                element.borderRadius || 0
              }px`,
              border: `${
                element.borderWidth || 0
              }px ${
                element.borderStyle ||
                "solid"
              } ${
                element.borderColor ||
                "transparent"
              }`,
            }}
          />
        )}

        {element.type === "divider" && (
          <div
            className="h-full w-full"
            style={{
              backgroundColor:
                element.backgroundColor ||
                element.color ||
                "#2563EB",
              borderRadius: `${
                element.borderRadius || 0
              }px`,
            }}
          />
        )}

        {element.type === "shape" && (
          <div
            className="h-full w-full"
            style={{
              backgroundColor:
                element.backgroundColor ||
                "#DBEAFE",
              borderRadius: `${
                element.borderRadius || 0
              }px`,
              border: `${
                element.borderWidth || 0
              }px ${
                element.borderStyle ||
                "solid"
              } ${
                element.borderColor ||
                "transparent"
              }`,
            }}
          />
        )}
      </div>
    </Rnd>
  );
}

const hasLikelyTextOverflow = (
  element: ResumeCanvasElement
) => {
  if (
    element.type !== "text" &&
    element.type !== "section"
  ) {
    return false;
  }

  const content =
    element.content || "";

  const fontSize =
    element.fontSize || 14;

  const charsPerLine =
    Math.max(
      10,
      Math.floor(
        element.width /
          Math.max(
            6,
            fontSize * 0.56
          )
      )
    );

  const visualLines =
    content
      .split("\n")
      .reduce(
        (total, line) =>
          total +
          Math.max(
            1,
            Math.ceil(
              Math.max(
                line.length,
                1
              ) /
                charsPerLine
            )
          ),
        0
      );

  const required =
    14 +
    visualLines *
      fontSize *
      (element.lineHeight ||
        1.4);

  return (
    required >
    element.height + 6
  );
};

/* =========================================================
   ELEMENT SAFETY NOTICE
========================================================= */

function ElementSafetyNotice({
  element,
}: {
  element: ResumeCanvasElement;
}) {
  const outsidePage =
    element.x < 0 ||
    element.y < 0 ||
    element.x + element.width >
      A4_WIDTH ||
    element.y + element.height >
      A4_HEIGHT;

  const outsideSafeArea =
    element.x < SAFE_MARGIN ||
    element.y < SAFE_MARGIN ||
    element.x + element.width >
      A4_WIDTH - SAFE_MARGIN ||
    element.y + element.height >
      A4_HEIGHT - SAFE_MARGIN;

  const textOverflow =
    hasLikelyTextOverflow(
      element
    );

  if (outsidePage) {
    return (
      <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3">
        <p className="text-xs font-bold text-red-700">
          Outside page
        </p>
        <p className="mt-1 text-xs leading-5 text-red-600">
          Part of this item may be cut off in the final PDF. Move or resize it inside the page.
        </p>
      </div>
    );
  }

  if (textOverflow) {
    return (
      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
        <p className="text-xs font-bold text-amber-700">
          Text may be clipped
        </p>
        <p className="mt-1 text-xs leading-5 text-amber-600">
          Increase this item’s height or reduce the font size so all content remains visible.
        </p>
      </div>
    );
  }

  if (outsideSafeArea) {
    return (
      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
        <p className="text-xs font-bold text-amber-700">
          Near page edge
        </p>
        <p className="mt-1 text-xs leading-5 text-amber-600">
          This is inside the page, but outside the recommended safe print area.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50 p-3">
      <p className="text-xs font-bold text-emerald-700">
        Safe position
      </p>
      <p className="mt-1 text-xs leading-5 text-emerald-600">
        This item is inside the recommended print area.
      </p>
    </div>
  );
}

/* =========================================================
   PAGE PROPERTIES
========================================================= */

function PageProperties({
  backgroundColor,
  onBackgroundChange,
}: {
  backgroundColor: string;
  onBackgroundChange: (value: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <PropertyLabel>Background</PropertyLabel>
        <ColorPicker value={backgroundColor} onChange={onBackgroundChange} compact />
      </div>

      <div>
        <PropertyLabel>Suggested</PropertyLabel>
        <div className="flex flex-wrap gap-2">
          {PAGE_PRESET_COLORS.map((color, index) => (
            <button
              key={`${color}-${index}`}
              type="button"
              onClick={() => onBackgroundChange(color)}
              className={`h-9 w-9 rounded-full border transition ${backgroundColor === color ? "ring-2 ring-blue-500 ring-offset-2" : "border-slate-200"}`}
              style={{ backgroundColor: color }}
              aria-label={color}
            />
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-slate-50 p-3">
        <p className="text-xs font-bold text-slate-700">CareerFlow tip</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Keep important content inside the dashed safe margin. Snap helps align items to margins, the page center, and nearby elements.
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   ELEMENT PROPERTIES
========================================================= */

function ElementProperties({
  element,
  activeTab,
  onChange,
  onDelete,
  onDuplicate,
  onBringForward,
  onSendBackward,
  onFocusSelected,
}: {
  element: ResumeCanvasElement;
  activeTab: "style" | "position" | "more";
  onChange: (patch: Partial<ResumeCanvasElement>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onFocusSelected: () => void;
}) {
  const isText = element.type === "text" || element.type === "section";

  if (activeTab === "position") {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="X" value={Math.round(element.x)} min={0} max={A4_WIDTH} onChange={(value) => onChange({ x: value })} />
          <NumberField label="Y" value={Math.round(element.y)} min={0} max={A4_HEIGHT} onChange={(value) => onChange({ y: value })} />
          <NumberField label="Width" value={Math.round(element.width)} min={20} max={A4_WIDTH} onChange={(value) => onChange({ width: value })} />
          <NumberField label="Height" value={Math.round(element.height)} min={2} max={A4_HEIGHT} onChange={(value) => onChange({ height: value })} />
        </div>

        <NumberField label="Rotation" value={element.rotation || 0} min={-180} max={180} onChange={(value) => onChange({ rotation: value })} />

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-600">
            Precise movement
          </p>
          <p className="mt-1 text-[11px] leading-5 text-slate-400">
            Arrow keys move 1px. Hold Shift + Arrow to move 10px.
          </p>
        </div>

        <div>
          <PropertyLabel>Opacity</PropertyLabel>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={element.opacity ?? 1}
              onChange={(event) => onChange({ opacity: Number(event.target.value) })}
              className="min-w-0 flex-1"
            />
            <span className="w-10 text-right text-xs font-semibold text-slate-500">
              {Math.round((element.opacity ?? 1) * 100)}%
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "more") {
    return (
      <div className="space-y-4">
        <button type="button" onClick={onFocusSelected} className="w-full rounded-xl border border-blue-200 bg-blue-50 px-3 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-100">
          Find selected item
        </button>

        <label className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-3">
          <span className="text-sm font-semibold text-slate-700">Lock position</span>
          <input type="checkbox" checked={Boolean(element.locked)} onChange={(event) => onChange({ locked: event.target.checked })} className="h-4 w-4 rounded border-slate-300 text-blue-600" />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={onBringForward} className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Bring forward</button>
          <button type="button" onClick={onSendBackward} className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Send backward</button>
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
          <button type="button" onClick={onDuplicate} className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Duplicate</button>
          <button type="button" onClick={onDelete} className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-100">Delete</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {isText && (
        <>
          {!getLinkedMeta(element) && (
          <div>
            <PropertyLabel>Text</PropertyLabel>
            <textarea
              rows={3}
              value={element.content || ""}
              onChange={(event) => onChange({ content: event.target.value })}
              className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            />
          </div>
          )}

          {getLinkedMeta(element) && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
              <p className="text-xs font-bold text-blue-800">
                Linked resume section
              </p>
              <p className="mt-1 text-xs leading-5 text-blue-700/80">
                Double-click this block on the resume to edit its information directly.
              </p>
            </div>
          )}

          <div>
            <PropertyLabel>Text color</PropertyLabel>
            <ColorPicker value={element.color || "#0F172A"} onChange={(value) => onChange({ color: value })} compact />
          </div>

          <div>
            <PropertyLabel>Font</PropertyLabel>
            <select
              value={element.fontFamily || FONT_OPTIONS[0].value}
              onChange={(event) => onChange({ fontFamily: event.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font.label} value={font.value}>{font.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Size" value={element.fontSize || 16} min={8} max={96} onChange={(value) => onChange({ fontSize: value })} />
            <NumberField label="Weight" value={element.fontWeight || 400} min={100} max={900} step={100} onChange={(value) => onChange({ fontWeight: value })} />
          </div>

          <div>
            <PropertyLabel>Alignment</PropertyLabel>
            <div className="grid grid-cols-3 gap-2">
              {(["left","center","right"] as ResumeTextAlign[]).map((align) => (
                <button
                  key={align}
                  type="button"
                  onClick={() => onChange({ textAlign: align })}
                  className={`rounded-lg border px-2 py-2 text-xs font-semibold capitalize transition ${(element.textAlign || "left") === align ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                >
                  {align}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {element.type === "photo" && (
        <>
          <div>
            <PropertyLabel>Photo shape</PropertyLabel>
            <div className="grid grid-cols-3 gap-2">
              {[["Square",0],["Rounded",18],["Circle",999]].map(([label,radius]) => (
                <button
                  key={String(label)}
                  type="button"
                  onClick={() => onChange({ borderRadius: Number(radius) })}
                  className="rounded-xl border border-slate-200 px-2 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  {String(label)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <PropertyLabel>Photo fit</PropertyLabel>
            <select
              value={element.objectFit || "cover"}
              onChange={(event) => onChange({ objectFit: event.target.value as "cover" | "contain" })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
            >
              <option value="cover">Fill frame</option>
              <option value="contain">Fit inside</option>
            </select>
          </div>
        </>
      )}

      {(element.type === "shape" || element.type === "divider") && (
        <div>
          <PropertyLabel>Color</PropertyLabel>
          <ColorPicker
            value={element.backgroundColor || element.color || "#2563EB"}
            onChange={(value) => onChange({ backgroundColor: value, color: value })}
            compact
          />
        </div>
      )}

      {element.type === "shape" && (
        <NumberField label="Corner radius" value={element.borderRadius || 0} min={0} max={100} onChange={(value) => onChange({ borderRadius: value })} />
      )}
    </div>
  );
}

/* =========================================================
   LINKED RESUME BLOCK
========================================================= */

function LinkedResumeBlock({
  element,
}: {
  element: ResumeCanvasElement;
}) {
  const lines =
    (element.content || "").split("\n");

  const heading =
    lines[0] || "";

  const body =
    lines.slice(1).join("\n");

  return (
    <div
      className="group relative h-full w-full overflow-hidden p-1"
      style={{
        fontFamily:
          element.fontFamily,
        fontSize:
          `${element.fontSize || 14}px`,
        lineHeight:
          element.lineHeight || 1.45,
        color:
          element.color || "#0F172A",
        textAlign:
          element.textAlign || "left",
      }}
    >
      <p
        className="font-bold uppercase tracking-[0.12em]"
        style={{
          color:
            element.color || "#0F172A",
          fontSize:
            `${Math.max(
              11,
              (element.fontSize || 14) *
                0.9
            )}px`,
        }}
      >
        {heading}
      </p>

      <div
        className="mt-3 whitespace-pre-wrap break-words"
        style={{
          fontWeight: 400,
        }}
      >
        {body}
      </div>

      <div className="pointer-events-none absolute right-1 top-1 rounded-md bg-white/90 px-1.5 py-0.5 text-[9px] font-semibold text-slate-400 opacity-0 shadow-sm transition group-hover:opacity-100">
        Double-click to edit
      </div>
    </div>
  );
}

/* =========================================================
   LINKED BLOCK EDITOR
========================================================= */

function LinkedBlockEditor({
  editor,
  value,
  onChange,
  onClose,
}: {
  editor: {
    kind: ResumeBlockKind;
    customId?: string;
  } | null;
  value: ResumeContentState;
  onChange: (
    value: ResumeContentState
  ) => void;
  onClose: () => void;
}) {
  if (!editor) {
    return null;
  }

  const update = (
    patch: Partial<ResumeContentState>
  ) => {
    onChange({
      ...value,
      ...patch,
    });
  };

  const titleMap: Record<
    ResumeBlockKind,
    string
  > = {
    profile: "Profile",
    contact: "Contact",
    summary: "Professional Summary",
    experience: "Experience",
    education: "Education",
    skills: "Skills",
    projects: "Projects",
    custom: "Custom Section",
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/40 p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close editor"
        onClick={onClose}
        className="absolute inset-0"
      />

      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-600">
              CareerFlow
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">
              Edit {titleMap[editor.kind]}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Changes appear on the resume immediately.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Done
          </button>
        </div>

        <div className="max-h-[calc(90vh-92px)] overflow-y-auto p-5">
          {editor.kind === "profile" && (
            <ContentInput
              label="Professional title"
              value={value.professionalTitle}
              onChange={(next) =>
                update({
                  professionalTitle:
                    next,
                })
              }
              placeholder="Frontend Developer"
            />
          )}

          {editor.kind === "contact" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ContentInput
                label="Email"
                value={value.email}
                onChange={(next) =>
                  update({
                    email: next,
                  })
                }
                placeholder="you@example.com"
              />
              <ContentInput
                label="Phone"
                value={value.phone}
                onChange={(next) =>
                  update({
                    phone: next,
                  })
                }
                placeholder="+95..."
              />
              <ContentInput
                label="Location"
                value={value.location}
                onChange={(next) =>
                  update({
                    location: next,
                  })
                }
                placeholder="Yangon, Myanmar"
              />
              <ContentInput
                label="LinkedIn"
                value={value.linkedinUrl}
                onChange={(next) =>
                  update({
                    linkedinUrl: next,
                  })
                }
                placeholder="linkedin.com/in/..."
              />
              <ContentInput
                label="GitHub"
                value={value.githubUrl}
                onChange={(next) =>
                  update({
                    githubUrl: next,
                  })
                }
                placeholder="github.com/..."
              />
              <ContentInput
                label="Portfolio"
                value={value.portfolioUrl}
                onChange={(next) =>
                  update({
                    portfolioUrl: next,
                  })
                }
                placeholder="yourportfolio.com"
              />
            </div>
          )}

          {editor.kind === "summary" && (
            <ContentTextarea
              label="Professional summary"
              value={value.summary}
              onChange={(next) =>
                update({
                  summary: next,
                })
              }
              placeholder="Write a short professional summary..."
              rows={6}
            />
          )}

          {editor.kind === "skills" && (
            <ContentTextarea
              label="Skills"
              value={value.skills}
              onChange={(next) =>
                update({
                  skills: next,
                })
              }
              placeholder="React, TypeScript, Node.js..."
              rows={5}
            />
          )}

          {editor.kind === "experience" && (
            <div className="space-y-4">
              {value.experience.map(
                (item, index) => (
                  <EditorCard
                    key={index}
                    title={`Experience ${index + 1}`}
                    onRemove={() =>
                      update({
                        experience:
                          value.experience.filter(
                            (_, itemIndex) =>
                              itemIndex !== index
                          ),
                      })
                    }
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <ContentInput
                        label="Job title"
                        value={item.job_title}
                        onChange={(next) =>
                          update({
                            experience:
                              value.experience.map(
                                (entry, itemIndex) =>
                                  itemIndex === index
                                    ? {
                                        ...entry,
                                        job_title:
                                          next,
                                      }
                                    : entry
                              ),
                          })
                        }
                        placeholder="Frontend Developer"
                      />
                      <ContentInput
                        label="Company"
                        value={item.company}
                        onChange={(next) =>
                          update({
                            experience:
                              value.experience.map(
                                (entry, itemIndex) =>
                                  itemIndex === index
                                    ? {
                                        ...entry,
                                        company: next,
                                      }
                                    : entry
                              ),
                          })
                        }
                        placeholder="Company"
                      />
                      <ContentInput
                        label="Start date"
                        value={item.start_date || ""}
                        onChange={(next) =>
                          update({
                            experience:
                              value.experience.map(
                                (entry, itemIndex) =>
                                  itemIndex === index
                                    ? {
                                        ...entry,
                                        start_date:
                                          next,
                                      }
                                    : entry
                              ),
                          })
                        }
                        placeholder="2024"
                      />
                      <ContentInput
                        label="End date"
                        value={item.end_date || ""}
                        onChange={(next) =>
                          update({
                            experience:
                              value.experience.map(
                                (entry, itemIndex) =>
                                  itemIndex === index
                                    ? {
                                        ...entry,
                                        end_date:
                                          next,
                                      }
                                    : entry
                              ),
                          })
                        }
                        placeholder="2026"
                      />
                      <div className="sm:col-span-2">
                        <ContentTextarea
                          label="Description"
                          value={item.description || ""}
                          onChange={(next) =>
                            update({
                              experience:
                                value.experience.map(
                                  (entry, itemIndex) =>
                                    itemIndex === index
                                      ? {
                                          ...entry,
                                          description:
                                            next,
                                        }
                                      : entry
                                ),
                            })
                          }
                          placeholder="Responsibilities and achievements..."
                        />
                      </div>
                    </div>
                  </EditorCard>
                )
              )}

              <AddRowButton
                label="Add experience"
                onClick={() =>
                  update({
                    experience: [
                      ...value.experience,
                      {
                        company: "",
                        job_title: "",
                        location: "",
                        start_date: "",
                        end_date: "",
                        currently_working: false,
                        description: "",
                      },
                    ],
                  })
                }
              />
            </div>
          )}

          {editor.kind === "education" && (
            <div className="space-y-4">
              {value.education.map(
                (item, index) => (
                  <EditorCard
                    key={index}
                    title={`Education ${index + 1}`}
                    onRemove={() =>
                      update({
                        education:
                          value.education.filter(
                            (_, itemIndex) =>
                              itemIndex !== index
                          ),
                      })
                    }
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <ContentInput
                        label="School"
                        value={item.school}
                        onChange={(next) =>
                          update({
                            education:
                              value.education.map(
                                (entry, itemIndex) =>
                                  itemIndex === index
                                    ? {
                                        ...entry,
                                        school: next,
                                      }
                                    : entry
                              ),
                          })
                        }
                        placeholder="University"
                      />
                      <ContentInput
                        label="Degree"
                        value={item.degree || ""}
                        onChange={(next) =>
                          update({
                            education:
                              value.education.map(
                                (entry, itemIndex) =>
                                  itemIndex === index
                                    ? {
                                        ...entry,
                                        degree: next,
                                      }
                                    : entry
                              ),
                          })
                        }
                        placeholder="Bachelor's degree"
                      />
                      <ContentInput
                        label="Field of study"
                        value={item.field_of_study || ""}
                        onChange={(next) =>
                          update({
                            education:
                              value.education.map(
                                (entry, itemIndex) =>
                                  itemIndex === index
                                    ? {
                                        ...entry,
                                        field_of_study:
                                          next,
                                      }
                                    : entry
                              ),
                          })
                        }
                        placeholder="Computer Science"
                      />
                    </div>
                  </EditorCard>
                )
              )}

              <AddRowButton
                label="Add education"
                onClick={() =>
                  update({
                    education: [
                      ...value.education,
                      {
                        school: "",
                        degree: "",
                        field_of_study: "",
                        start_date: "",
                        end_date: "",
                      },
                    ],
                  })
                }
              />
            </div>
          )}

          {editor.kind === "projects" && (
            <div className="space-y-4">
              {value.projects.map(
                (item, index) => (
                  <EditorCard
                    key={index}
                    title={`Project ${index + 1}`}
                    onRemove={() =>
                      update({
                        projects:
                          value.projects.filter(
                            (_, itemIndex) =>
                              itemIndex !== index
                          ),
                      })
                    }
                  >
                    <div className="space-y-4">
                      <ContentInput
                        label="Project name"
                        value={item.name}
                        onChange={(next) =>
                          update({
                            projects:
                              value.projects.map(
                                (entry, itemIndex) =>
                                  itemIndex === index
                                    ? {
                                        ...entry,
                                        name: next,
                                      }
                                    : entry
                              ),
                          })
                        }
                        placeholder="CareerFlow"
                      />
                      <ContentTextarea
                        label="Description"
                        value={item.description || ""}
                        onChange={(next) =>
                          update({
                            projects:
                              value.projects.map(
                                (entry, itemIndex) =>
                                  itemIndex === index
                                    ? {
                                        ...entry,
                                        description:
                                          next,
                                      }
                                    : entry
                              ),
                          })
                        }
                        placeholder="Describe the project..."
                      />
                    </div>
                  </EditorCard>
                )
              )}

              <AddRowButton
                label="Add project"
                onClick={() =>
                  update({
                    projects: [
                      ...value.projects,
                      {
                        name: "",
                        description: "",
                        url: "",
                      },
                    ],
                  })
                }
              />
            </div>
          )}

          {editor.kind === "custom" && (() => {
            const section =
              value.customSections.find(
                (item) =>
                  item.id ===
                  editor.customId
              );

            if (!section) {
              return (
                <p className="text-sm text-slate-500">
                  This custom section no longer exists.
                </p>
              );
            }

            return (
              <div className="space-y-4">
                <ContentInput
                  label="Section title"
                  value={section.title}
                  onChange={(next) =>
                    update({
                      customSections:
                        value.customSections.map(
                          (item) =>
                            item.id ===
                            section.id
                              ? {
                                  ...item,
                                  title: next,
                                }
                              : item
                        ),
                    })
                  }
                  placeholder="Languages, Awards, Certifications..."
                />

                <ContentTextarea
                  label="Information"
                  value={section.content}
                  onChange={(next) =>
                    update({
                      customSections:
                        value.customSections.map(
                          (item) =>
                            item.id ===
                            section.id
                              ? {
                                  ...item,
                                  content: next,
                                }
                              : item
                        ),
                    })
                  }
                  placeholder="Add your information..."
                  rows={6}
                />
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   RESUME CONTENT EDITOR
========================================================= */

function ResumeContentEditor({
  open,
  value,
  onChange,
  onClose,
}: {
  open: boolean;
  value: ResumeContentState;
  onChange: (
    value: ResumeContentState
  ) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<
    | "basics"
    | "experience"
    | "education"
    | "projects"
    | "extra"
  >("basics");

  if (!open) {
    return null;
  }

  const update = (
    patch: Partial<ResumeContentState>
  ) => {
    onChange({
      ...value,
      ...patch,
    });
  };

  const updateExperience = (
    index: number,
    patch: Partial<ResumeExperience>
  ) => {
    update({
      experience:
        value.experience.map(
          (item, itemIndex) =>
            itemIndex === index
              ? {
                  ...item,
                  ...patch,
                }
              : item
        ),
    });
  };

  const updateEducation = (
    index: number,
    patch: Partial<ResumeEducation>
  ) => {
    update({
      education:
        value.education.map(
          (item, itemIndex) =>
            itemIndex === index
              ? {
                  ...item,
                  ...patch,
                }
              : item
        ),
    });
  };

  const updateProject = (
    index: number,
    patch: Partial<ResumeProject>
  ) => {
    update({
      projects:
        value.projects.map(
          (item, itemIndex) =>
            itemIndex === index
              ? {
                  ...item,
                  ...patch,
                }
              : item
        ),
    });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/40 p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close resume information"
        onClick={onClose}
        className="absolute inset-0"
      />

      <div className="relative z-10 flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-600">
              CareerFlow
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Resume information
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Enter your information once. Linked resume sections update automatically.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Done
          </button>
        </div>

        <div className="border-b border-slate-200 px-4 py-3 sm:px-6">
          <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {(
              [
                ["basics", "Basics"],
                ["experience", "Experience"],
                ["education", "Education"],
                ["projects", "Projects"],
                ["extra", "Extra"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() =>
                  setTab(key)
                }
                className={`shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  tab === key
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto p-5 sm:p-6">
          {tab === "basics" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ContentInput
                label="Professional title"
                value={value.professionalTitle}
                onChange={(next) =>
                  update({
                    professionalTitle:
                      next,
                  })
                }
                placeholder="Frontend Developer"
              />

              <ContentInput
                label="Email"
                value={value.email}
                onChange={(next) =>
                  update({
                    email: next,
                  })
                }
                placeholder="you@example.com"
              />

              <ContentInput
                label="Phone"
                value={value.phone}
                onChange={(next) =>
                  update({
                    phone: next,
                  })
                }
                placeholder="+95..."
              />

              <ContentInput
                label="Location"
                value={value.location}
                onChange={(next) =>
                  update({
                    location: next,
                  })
                }
                placeholder="Yangon, Myanmar"
              />

              <ContentInput
                label="LinkedIn"
                value={value.linkedinUrl}
                onChange={(next) =>
                  update({
                    linkedinUrl: next,
                  })
                }
                placeholder="linkedin.com/in/..."
              />

              <ContentInput
                label="GitHub"
                value={value.githubUrl}
                onChange={(next) =>
                  update({
                    githubUrl: next,
                  })
                }
                placeholder="github.com/..."
              />

              <ContentInput
                label="Portfolio"
                value={value.portfolioUrl}
                onChange={(next) =>
                  update({
                    portfolioUrl: next,
                  })
                }
                placeholder="yourportfolio.com"
              />

              <div className="sm:col-span-2">
                <ContentTextarea
                  label="Professional summary"
                  value={value.summary}
                  onChange={(next) =>
                    update({
                      summary: next,
                    })
                  }
                  placeholder="Write a short professional summary..."
                />
              </div>

              <div className="sm:col-span-2">
                <ContentTextarea
                  label="Skills"
                  value={value.skills}
                  onChange={(next) =>
                    update({
                      skills: next,
                    })
                  }
                  placeholder="React, TypeScript, Node.js, MySQL..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {tab === "experience" && (
            <div className="space-y-4">
              {value.experience.map(
                (item, index) => (
                  <EditorCard
                    key={index}
                    title={`Experience ${index + 1}`}
                    onRemove={() =>
                      update({
                        experience:
                          value.experience.filter(
                            (_, itemIndex) =>
                              itemIndex !== index
                          ),
                      })
                    }
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <ContentInput
                        label="Job title"
                        value={item.job_title}
                        onChange={(next) =>
                          updateExperience(
                            index,
                            {
                              job_title: next,
                            }
                          )
                        }
                        placeholder="Frontend Developer"
                      />
                      <ContentInput
                        label="Company"
                        value={item.company}
                        onChange={(next) =>
                          updateExperience(
                            index,
                            {
                              company: next,
                            }
                          )
                        }
                        placeholder="Company"
                      />
                      <ContentInput
                        label="Location"
                        value={item.location || ""}
                        onChange={(next) =>
                          updateExperience(
                            index,
                            {
                              location: next,
                            }
                          )
                        }
                        placeholder="Yangon"
                      />
                      <div />
                      <ContentInput
                        label="Start date"
                        value={item.start_date || ""}
                        onChange={(next) =>
                          updateExperience(
                            index,
                            {
                              start_date: next,
                            }
                          )
                        }
                        placeholder="2024"
                      />
                      <ContentInput
                        label="End date"
                        value={item.end_date || ""}
                        onChange={(next) =>
                          updateExperience(
                            index,
                            {
                              end_date: next,
                            }
                          )
                        }
                        placeholder="2026"
                      />
                      <label className="flex items-center gap-2 sm:col-span-2">
                        <input
                          type="checkbox"
                          checked={
                            item.currently_working ||
                            false
                          }
                          onChange={(event) =>
                            updateExperience(
                              index,
                              {
                                currently_working:
                                  event.target.checked,
                              }
                            )
                          }
                          className="h-4 w-4 rounded border-slate-300 text-blue-600"
                        />
                        <span className="text-sm text-slate-600">
                          I currently work here
                        </span>
                      </label>
                      <div className="sm:col-span-2">
                        <ContentTextarea
                          label="Description"
                          value={item.description || ""}
                          onChange={(next) =>
                            updateExperience(
                              index,
                              {
                                description: next,
                              }
                            )
                          }
                          placeholder="Responsibilities and achievements..."
                        />
                      </div>
                    </div>
                  </EditorCard>
                )
              )}

              <AddRowButton
                label="Add experience"
                onClick={() =>
                  update({
                    experience: [
                      ...value.experience,
                      {
                        company: "",
                        job_title: "",
                        location: "",
                        start_date: "",
                        end_date: "",
                        currently_working: false,
                        description: "",
                      },
                    ],
                  })
                }
              />
            </div>
          )}

          {tab === "education" && (
            <div className="space-y-4">
              {value.education.map(
                (item, index) => (
                  <EditorCard
                    key={index}
                    title={`Education ${index + 1}`}
                    onRemove={() =>
                      update({
                        education:
                          value.education.filter(
                            (_, itemIndex) =>
                              itemIndex !== index
                          ),
                      })
                    }
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <ContentInput
                        label="School"
                        value={item.school}
                        onChange={(next) =>
                          updateEducation(
                            index,
                            {
                              school: next,
                            }
                          )
                        }
                        placeholder="University"
                      />
                      <ContentInput
                        label="Degree"
                        value={item.degree || ""}
                        onChange={(next) =>
                          updateEducation(
                            index,
                            {
                              degree: next,
                            }
                          )
                        }
                        placeholder="Bachelor's degree"
                      />
                      <ContentInput
                        label="Field of study"
                        value={item.field_of_study || ""}
                        onChange={(next) =>
                          updateEducation(
                            index,
                            {
                              field_of_study: next,
                            }
                          )
                        }
                        placeholder="Computer Science"
                      />
                      <div />
                      <ContentInput
                        label="Start date"
                        value={item.start_date || ""}
                        onChange={(next) =>
                          updateEducation(
                            index,
                            {
                              start_date: next,
                            }
                          )
                        }
                        placeholder="2021"
                      />
                      <ContentInput
                        label="End date"
                        value={item.end_date || ""}
                        onChange={(next) =>
                          updateEducation(
                            index,
                            {
                              end_date: next,
                            }
                          )
                        }
                        placeholder="2025"
                      />
                    </div>
                  </EditorCard>
                )
              )}

              <AddRowButton
                label="Add education"
                onClick={() =>
                  update({
                    education: [
                      ...value.education,
                      {
                        school: "",
                        degree: "",
                        field_of_study: "",
                        start_date: "",
                        end_date: "",
                      },
                    ],
                  })
                }
              />
            </div>
          )}

          {tab === "projects" && (
            <div className="space-y-4">
              {value.projects.map(
                (item, index) => (
                  <EditorCard
                    key={index}
                    title={`Project ${index + 1}`}
                    onRemove={() =>
                      update({
                        projects:
                          value.projects.filter(
                            (_, itemIndex) =>
                              itemIndex !== index
                          ),
                      })
                    }
                  >
                    <div className="space-y-4">
                      <ContentInput
                        label="Project name"
                        value={item.name}
                        onChange={(next) =>
                          updateProject(
                            index,
                            {
                              name: next,
                            }
                          )
                        }
                        placeholder="CareerFlow"
                      />
                      <ContentInput
                        label="Project URL"
                        value={item.url || ""}
                        onChange={(next) =>
                          updateProject(
                            index,
                            {
                              url: next,
                            }
                          )
                        }
                        placeholder="https://..."
                      />
                      <ContentTextarea
                        label="Description"
                        value={item.description || ""}
                        onChange={(next) =>
                          updateProject(
                            index,
                            {
                              description: next,
                            }
                          )
                        }
                        placeholder="Describe the project..."
                      />
                    </div>
                  </EditorCard>
                )
              )}

              <AddRowButton
                label="Add project"
                onClick={() =>
                  update({
                    projects: [
                      ...value.projects,
                      {
                        name: "",
                        description: "",
                        url: "",
                      },
                    ],
                  })
                }
              />
            </div>
          )}

          {tab === "extra" && (
            <div className="space-y-4">
              {value.customSections.map(
                (section, index) => (
                  <EditorCard
                    key={section.id}
                    title={`Custom section ${index + 1}`}
                    onRemove={() =>
                      update({
                        customSections:
                          value.customSections.filter(
                            (item) =>
                              item.id !==
                              section.id
                          ),
                      })
                    }
                  >
                    <div className="space-y-4">
                      <ContentInput
                        label="Section title"
                        value={section.title}
                        onChange={(next) =>
                          update({
                            customSections:
                              value.customSections.map(
                                (item) =>
                                  item.id ===
                                  section.id
                                    ? {
                                        ...item,
                                        title: next,
                                      }
                                    : item
                              ),
                          })
                        }
                        placeholder="Languages, Certifications, Awards..."
                      />

                      <ContentTextarea
                        label="Information"
                        value={section.content}
                        onChange={(next) =>
                          update({
                            customSections:
                              value.customSections.map(
                                (item) =>
                                  item.id ===
                                  section.id
                                    ? {
                                        ...item,
                                        content: next,
                                      }
                                    : item
                              ),
                          })
                        }
                        placeholder="Add your information..."
                      />
                    </div>
                  </EditorCard>
                )
              )}

              <AddRowButton
                label="Add custom section"
                onClick={() =>
                  update({
                    customSections: [
                      ...value.customSections,
                      {
                        id: createId(),
                        title: "",
                        content: "",
                      },
                    ],
                  })
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ContentInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <PropertyLabel>{label}</PropertyLabel>
      <input
        type="text"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
      />
    </div>
  );
}

function ContentTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows?: number;
}) {
  return (
    <div>
      <PropertyLabel>{label}</PropertyLabel>
      <textarea
        rows={rows}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
      />
    </div>
  );
}

function EditorCard({
  title,
  onRemove,
  children,
}: {
  title: string;
  onRemove: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-slate-800">
          {title}
        </h3>
        <button
          type="button"
          onClick={onRemove}
          className="text-xs font-semibold text-red-600 hover:text-red-700"
        >
          Remove
        </button>
      </div>
      {children}
    </div>
  );
}

function AddRowButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
    >
      + {label}
    </button>
  );
}

function ResumeBlockButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[10px] font-bold text-blue-700">
        {icon}
      </span>
      <span className="truncate">
        {label}
      </span>
    </button>
  );
}

/* =========================================================
   UI HELPERS
========================================================= */

function ToolbarButton({
  children,
  onClick,
  disabled = false,
  title,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function ToolButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold">
        {icon}
      </span>

      <span className="truncate">
        {label}
      </span>
    </button>
  );
}

function PropertyLabel({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
      {children}
    </label>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <PropertyLabel>{label}</PropertyLabel>

      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => {
          const next = Number(
            event.target.value
          );

          if (Number.isFinite(next)) {
            onChange(next);
          }
        }}
        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
      />
    </div>
  );
}

function ColorPicker({
  value,
  onChange,
  compact = false,
}: {
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}) {
  const safeValue = /^#[0-9A-Fa-f]{6}$/.test(value) ? value : "#2563EB";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2">
        <input
          type="color"
          value={safeValue}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          className="h-9 w-11 cursor-pointer border-0 bg-transparent p-0"
        />

        <input
          type="text"
          value={value}
          onChange={(event) => {
            const next = event.target.value.toUpperCase();
            if (/^#[0-9A-F]{0,6}$/.test(next)) {
              onChange(next);
            }
          }}
          className="min-w-0 flex-1 border-0 bg-transparent text-sm font-semibold text-slate-700 outline-none"
        />
      </div>

      {!compact && (
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onChange(color)}
              className={`h-7 w-7 rounded-full border-2 transition ${value.toUpperCase() === color ? "border-slate-900 ring-2 ring-slate-200" : "border-white ring-1 ring-slate-200"}`}
              style={{ backgroundColor: color }}
              aria-label={color}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ResumeDesignStudio;