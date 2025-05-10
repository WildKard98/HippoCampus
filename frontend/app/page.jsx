// Shift + Option + F to Format code
"use client";
import { useState, useRef, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { motion, AnimatePresence } from "framer-motion"; // 🔹 Import motion at the top of your file
import 'bootstrap-icons/font/bootstrap-icons.css';
import CrosswordPuzzlePage from "./Crossword/crosswordpage";
import GeneratePuzzle from "./Crossword/generatepuzzle";
import { useLanguage } from "./Language/languagecontext";
import AuthForm from "./auth";
import { createStudySet } from './api';
import { updateStudySet } from './api';
import { getStudySets } from './api';
import { getPublicSets } from './api';
import { toggleLikeSet } from './api';
import { starTerm, unstarTerm } from './api';
import { getPuzzleSets, getPublicPuzzleSets, toggleLikePuzzleSet } from "./api";
import { updatePuzzleSet } from './api';
import { deleteStudySet } from "./api";
import { deletePuzzleSet } from "./api";
import EditSet from "./CreateEditSet/editset"
import CreateSet from "./CreateEditSet/createset"
import FlashcardReview from "./FlashCardReview/flashcardreview"

export default function Home() {
  useEffect(() => {
    document.body.style.fontFamily = "Itim, sans-serif";
  }, []);
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const [isCreatingSet, setIsCreatingSet] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isWingPanelOpen, setIsWingPanelOpen] = useState(false);
  const [isEditingSet, setIsEditingSet] = useState(null);
  const [screenWidth, setScreenWidth] = useState(0);
  const [isCreatePuzzle, setIsCreatePuzzle] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [isHome, setIsHome] = useState(true); // ✅ default to true
  const [selectedPuzzle, setSelectedPuzzle] = useState(null);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const { t, setLang, lang } = useLanguage();
  const [isAuth, setIsAuth] = useState(false);
  const [username, setUsername] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [shuffledDefinitions, setShuffledDefinitions] = useState([]);
  const [selectedSet, setSelectedSet] = useState(null);
  const studyTips = t.studyTips;
  const [randomTip, setRandomTip] = useState(studyTips[0]);
  const [showNeedLogin, setShowNeedLogin] = useState(false);
  const [starredTerms, setStarredTerms] = useState({});
  const [showSetOption, setShowSetOption] = useState(false);
  const dropdownRef = useRef();
  const [hasMounted, setHasMounted] = useState(false);
  const [isLoadingSets, setIsLoadingSets] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showCrosswordPuzzle, setShowCrosswordPuzzle] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef();
  const [refreshStudyFlag, setRefreshStudyFlag] = useState(false);
  const [refreshPuzzleFlag, setRefreshPuzzleFlag] = useState(false);
  const [isLoadingPuzzles, setIsLoadingPuzzles] = useState(true);


  const toggleStar = async (term, setId) => {
    const username = localStorage.getItem("username");
    if (!username || !setId) return;

    try {
      if (starredTerms[term]) {
        await unstarTerm(username, setId, term);
        setStarredTerms(prev => {
          const newTerms = { ...prev };
          delete newTerms[term];
          return newTerms;
        });
      } else {
        await starTerm(username, setId, term);
        setStarredTerms(prev => ({ ...prev, [term]: true }));
      }
    } catch (err) {
      console.error("Failed to toggle star:", err);
    }
  };


  const reloadAuthInfo = () => {
    const token = localStorage.getItem("token");
    const savedUsername = localStorage.getItem("username");
    if (token && savedUsername) {
      setIsAuth(true);
      setUsername(savedUsername);

      getStudySets(savedUsername)
        .then((sets) => setStudySets(sets))
        .catch((err) => console.error('Failed to refresh study sets after login:', err))
        .finally(() => setIsLoadingSets(false));
    }
  };

  // fetch username studyset
  const [studySets, setStudySets] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUsername = localStorage.getItem("username");

    if (token && savedUsername) {
      // after login success
      setIsAuth(true);
      setUsername(savedUsername);
      setShowLogin(false);

      getStudySets(savedUsername)
        .then((sets) => setStudySets(sets))
        .catch((err) => console.error('Failed to refresh study sets after login:', err))
        .finally(() => setIsLoadingSets(false));

    }
  }, []);

  // fetch public set
  const [publicSets, setPublicSets] = useState([]);
  useEffect(() => {
    async function fetchPublicSets() {
      try {
        const response = await getPublicSets();  // Fetch public sets from the backend
        console.log("Public Sets: ", response);
        setPublicSets(response);
      } catch (err) {
        console.error("Failed to fetch public sets:", err);
      } finally {
        setIsLoadingSets(false); // ✅ Add this here too
      }
    }
    fetchPublicSets();
  }, []);

  // fetch username puzzleset
  const [puzzleSets, setPuzzleSets] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUsername = localStorage.getItem("username");

    if (token && savedUsername) {
      // after login success
      setIsAuth(true);
      setUsername(savedUsername);
      setShowLogin(false);

      getPuzzleSets(savedUsername)
        .then((sets) => setPuzzleSets(sets))
        .catch((err) => console.error('Failed to refresh Puzzle sets after login:', err));

    }
  }, []);

  // fetch public puzzle set
  const [publicPuzzleSets, setPublicPuzzleSets] = useState([]);
  useEffect(() => {
    async function fetchPublicPuzzleSets() {
      try {
        setIsLoadingPuzzles(true); // ✅ START loading
        const response = await getPublicPuzzleSets();
        setPublicPuzzleSets(response);
      } catch (err) {
        console.error("Failed to fetch public Puzzle sets:", err);
      } finally {
        setIsLoadingPuzzles(false); // ✅ END loading
      }
    }
    fetchPublicPuzzleSets();
  }, []);
  

  const lowerSearch = searchTerm.toLowerCase();

  useEffect(() => {
    const tip = studyTips[Math.floor(Math.random() * studyTips.length)];
    setRandomTip(tip);
  }, [t]); // 🔁 update on language change

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
      if (window.innerWidth > 770) {
        setIsWingPanelOpen(false); // Auto-hide WingPanel when screen gets bigger
      }
    };

    handleResize(); // Set initial width on mount
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".user-dropdown")) {
        setShowDropdown(false);
      }
      if (!e.target.closest(".lang-menu")) {
        setShowLangMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSetOption(false);
      }
    };

    if (showSetOption) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSetOption]);

  useEffect(() => {
    if (screenWidth > 770 && screenWidth < 1000) {
      setIsMenuCollapsed(true); // collapse the side panel
    } else if (screenWidth >= 1000) {
      setIsMenuCollapsed(false); // expand side panel
    }
    // else, do nothing for ≤ 770 (handled by WingPanel)
  }, [screenWidth]);

  useEffect(() => {
    setHasMounted(true);
    const updateWidth = () => setScreenWidth(window.innerWidth);
    updateWidth(); // Set initial width
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  function needLogin(action) {
    if (!username) {
      setShowNeedLogin(true);
      return false;
    }
    action();
    return true;
  }

  useEffect(() => {
    const storedLang = localStorage.getItem("lang");
    if (storedLang) {
      setLang(storedLang); // ✅ Use stored language
    } else {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const defaultLang =
        timezone.startsWith("Asia/Ho_Chi_Minh") || timezone.startsWith("Asia/Bangkok")
          ? "vi"
          : "en";
      setLang(defaultLang);
      localStorage.setItem("lang", defaultLang); // ✅ Save to localStorage
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]); // Hide dropdown
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (username) {
      getPuzzleSets(username)
        .then((sets) => setPuzzleSets(sets))
        .catch((err) => console.error('❌ Failed to refresh puzzle sets:', err));
    }
  }, [refreshPuzzleFlag]);



  return (
    <DndProvider backend={HTML5Backend}>
      {showLogin ? (
        <AuthForm
          screenWidth={screenWidth}
          onBack={() => setShowLogin(false)}
          reloadAuthInfo={reloadAuthInfo}
          t={t}
        />

      ) : (
        <div className="min-h-screen bg-black text-white flex flex-col">

          {/* Unified Header */}
          <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center bg-black/50 text-[#00e0ff] flex-wrap shadow-md rounded-3xl border border-[#00e0ff] backdrop-blur-md ">


            {/* Left: Hamburger & App Name */}
            <div className="flex items-center p-4">
              {hasMounted && screenWidth > 480 && (
                <button
                  className="bg-black text-[#00e0ff] text-2xl focus:outline-none w-9 h-9 min-w-[36px] min-h-[36px] flex-shrink-0 flex items-center justify-center rounded-full transition duration-300 hover:bg-[#00e0ff] hover:text-black"
                  onClick={() => {
                    if (window.innerWidth <= 770) {
                      setIsWingPanelOpen(true);  // Open WingPanel if screen width ≤ 770px
                    } else {
                      setIsMenuCollapsed(!isMenuCollapsed); // Otherwise, toggle side panel
                    }
                  }}
                >
                  ☰
                </button>
              )}

              {/* Web Title (Changes based on screen size) */}
              <img
                src="/logo5.png"
                alt="Hippocampus Logo"
                className={`h-10 w-15 object-contain ml-1 ${screenWidth <= 770 ? "block" : "hidden"}`}
              />
              <div className="fle ">
                <img
                  src="/logo6.png"
                  alt="Hippocampus Logo"
                  className={`h-11 w-40 object-contain ml-2 ${screenWidth > 770 ? "block" : "hidden"}`}
                />
              </div>
            </div>


            {/* Middle: Search Bar */}
            {screenWidth >= 660 && (
              <div className="flex-1 max-w-[800px] p-4" ref={searchRef}>
                <div className="relative w-full">
                  <i className="bi bi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-white pt-1/2"></i>
                  <input

                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchTerm(value);

                      if (value.trim() === "") {
                        setSearchResults([]);
                        setIsSearching(false);
                        return;
                      }

                      setIsSearching(true); // ⏳ Start loading

                      const lower = value.toLowerCase();

                      const results = [
                        ...studySets.filter(s => s.title.toLowerCase().includes(lower)).map(s => ({ ...s, type: "study", isPublic: false })),
                        ...puzzleSets.filter(s => s.title.toLowerCase().includes(lower)).map(s => ({ ...s, type: "puzzle", isPublic: false })),
                        ...publicSets.filter(s => s.title.toLowerCase().includes(lower)).map(s => ({ ...s, type: "study", isPublic: true })),
                        ...publicPuzzleSets.filter(s => s.title.toLowerCase().includes(lower)).map(s => ({ ...s, type: "puzzle", isPublic: true }))
                      ];

                      setTimeout(() => { // fake delay for UX smoothing (optional)
                        setSearchResults(results.slice(0, 10));
                        setIsSearching(false); // ✅ Done loading
                      }, 300);
                    }}
                    placeholder={t.searchbar}
                    className="bg-black text-white placeholder-white px-10 py-2 rounded-2xl w-full border border-white focus:outline-none focus:ring-2 focus:ring-white transition"
                  />
                  {searchResults.length > 0 && (
                    <div className="absolute top-full mt-1 bg-black border border-white rounded-2xl w-full z-50 shadow-lg">
                      {searchResults.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setSearchTerm("");
                            setSearchResults([]);

                            if (item.type === "study") {
                              setIsCreatingSet("library");
                              setSelectedSet(item);
                              setIsHome(false);
                            } else {
                              setIsCreatePuzzle(true);          // ✅ Ensure puzzle mode is active
                              setSelectedSet(null);            // ✅ Clear study set
                              setSelectedPuzzle(item);         // ✅ Set current puzzle
                              setShowGenerator("play");        // ✅ Required if you want puzzle viewer
                              setIsHome(false);
                            }
                          }}
                          className="px-4 py-2 hover:bg-[#00e0ff] text-white hover:text-black cursor-pointer flex rounded-2xl justify-between items-center"
                        >
                          <span className="font-bold">{item.title}</span>
                          <span className="flex items-center gap-2 text-sm text-[#ff7700]">
                            <i className={`bi ${item.type === "puzzle" ? "bi-puzzle" : "bi-journal"}`}></i>
                            {item.isPublic ? "(Public)" : "(Yours)"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            )}


            {/* Right: Plus Button, Type/Draw Toggle, User Info */}
            <div className="flex items-center gap-2 p-4">
              {screenWidth > 480 && (
                <div className="relative inline-block text-left" ref={dropdownRef}>
                  <button
                    onClick={() => setShowSetOption((prev) => !prev)}
                    className="bg-black border-2 border-[#ff7700] text-[#ff7700] px-4 py-2 rounded-3xl transition duration-300 hover:bg-[#ff7700] hover:text-black shadow-md hover:shadow-[0_0_12px_#ff7700]"
                  >
                    +
                  </button>

                  {showSetOption && (
                    <div className="absolute right-0 mt-2 w-[140px] rounded-md shadow-lg bg-black ring-1 ring-[#ff7700] ring-opacity-50 z-50">
                      <div className="py-1 text-[#ff7700] drop-shadow-[0_0_4px_#ff7700]">
                        <button
                          onClick={() => {
                            setShowSetOption(false);
                            needLogin(() => {
                              setIsCreatingSet(true);
                              setIsEditingSet(null);
                              setIsCreatePuzzle(false);
                              setSelectedSet(null);
                              setIsHome(false);
                            });
                          }}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-[#ff7700] hover:text-black"
                        >
                          <i className="bi bi-journal mr-2"></i>
                          {t.createset}
                        </button>
                        <button
                          onClick={() => {
                            setShowSetOption(false);
                            needLogin(() => {
                              setShowGenerator(true);
                              setIsCreatingSet(false);
                              setSelectedSet(null);
                              setIsHome(false);
                            });
                          }}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-[#ff7700] hover:text-black"
                        >
                          <i className="bi bi-puzzle mr-2"></i>
                          {t.createnewpuzzle}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}


              {/* user name, login */}
              {!isAuth ? (
                <button
                  onClick={() => setShowLogin(true)}
                  className="bg-[#00e0ff] text-black px-4 py-2 rounded-full font-semibold hover:bg-[#00bfff] transition"
                >
                  {t.login}
                </button>
              ) : (
                <div className="relative">
                  <div className="relative user-dropdown">
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="bg-[#00e0ff] text-black px-4 py-2 rounded-full font-semibold hover:bg-[#00bfff] transition w-[150px] truncate"
                    >
                      {username}
                    </button>
                    {showDropdown && (
                      <div className="absolute right-0 mt-2 w-[150px] bg-black border border-[#00e0ff] rounded-3xl shadow-[0_0_12px_#00e0ff] z-50">
                        <button
                          onClick={() => {
                            setIsAuth(false);
                            setUsername("");
                            setStudySets([]);
                            setShowDropdown(false); // 👈 CLOSE DROPDOWN ON LOGOUT TOO
                            localStorage.removeItem("token");
                            localStorage.removeItem("username");
                          }}
                          className="block w-full px-4 py-2 text-left text-[#00e0ff] hover:bg-[#00e0ff] hover:text-black transition rounded-3xl"
                        >
                          {t.logout}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}


              <div className="relative lang-menu">
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setShowLangMenu((prev) => !prev)}
                >
                  <div className="min-w-[80px] max-w-[80px] px-2 py-1 bg-black border border-[#00e0ff] rounded-3xl flex items-center justify-center">
                    <span className="text-[#00e0ff] drop-shadow-[0_0_8px_#00e0ff] font-semibold text-sm whitespace-nowrap">
                      {lang === "vi" ? "Tiếng Việt" : "English"}
                    </span>
                  </div>
                </div>

                {showLangMenu && (
                  <div className="absolute right-0 mt-2 w-32 bg-black border border-[#00e0ff] rounded-3xl shadow-[0_0_12px_#00e0ff] z-50">
                    <button
                      onClick={() => { setLang("en"); setShowLangMenu(false); }}
                      className="w-full px-4 py-2 text-left text-[#00e0ff] rounded-3xl hover:bg-[#00e0ff] hover:text-black transition"
                    >
                      English
                    </button>
                    <button
                      onClick={() => { setLang("vi"); setShowLangMenu(false); }}
                      className="w-full px-4 py-2 text-left text-[#00e0ff] rounded-3xl hover:bg-[#00e0ff] hover:text-black transition"
                    >
                      Tiếng Việt
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Search bar adjusts when screen width < 620px */}
            {screenWidth <= 660 && (
              <div className="w-full flex justify-center px-3 pb-3" ref={searchRef}>
                <div className="relative w-full max-w-none">
                  <i className="bi bi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-white pt-1/2"></i>
                  <input
                    type="text"
                    placeholder={t.searchbar}
                    value={searchTerm}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchTerm(value);

                      if (value.trim() === "") {
                        setSearchResults([]);
                        setIsSearching(false);
                        return;
                      }

                      setIsSearching(true);

                      const lower = value.toLowerCase();
                      const results = [
                        ...studySets.filter(s => s.title.toLowerCase().includes(lower)).map(s => ({ ...s, type: "study", isPublic: false })),
                        ...puzzleSets.filter(s => s.title.toLowerCase().includes(lower)).map(s => ({ ...s, type: "puzzle", isPublic: false })),
                        ...publicSets.filter(s => s.title.toLowerCase().includes(lower)).map(s => ({ ...s, type: "study", isPublic: true })),
                        ...publicPuzzleSets.filter(s => s.title.toLowerCase().includes(lower)).map(s => ({ ...s, type: "puzzle", isPublic: true }))
                      ];

                      setTimeout(() => {
                        setSearchResults(results.slice(0, 10));
                        setIsSearching(false);
                      }, 300);
                    }}
                    className="bg-black text-white placeholder-white px-10 py-2 rounded-2xl w-full border border-white focus:outline-none focus:ring-2 focus:ring-white"
                  />

                  {/* 🔄 Spinner */}
                  {isSearching && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <i className="bi bi-arrow-repeat animate-spin text-[#00e0ff] text-xl"></i>
                    </div>
                  )}

                  {/* 🔽 Results Dropdown */}
                  {searchResults.length > 0 && (
                    <div className="absolute top-full mt-1 w-full z-50 border border-white rounded-2xl shadow-lg
                   bg-black/90 backdrop-blur-md">
                      {searchResults.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setSearchTerm("");
                            setSearchResults([]);
                            if (item.type === "study") {
                              setIsCreatingSet("library");
                              setSelectedSet(item);
                              setIsHome(false);
                            } else {
                              setIsCreatePuzzle(true);
                              setSelectedSet(null);
                              setSelectedPuzzle(item);
                              setShowGenerator("play");
                              setIsHome(false);
                            }
                          }}
                          className="px-4 py-2 hover:bg-[#00e0ff] text-white rounded-2xl hover:text-black cursor-pointer flex justify-between items-center"
                        >
                          <span className="font-bold">{item.title}</span>
                          <span className="flex items-center gap-2 text-sm text-[#ff7700]">
                            <i className={`bi ${item.type === "puzzle" ? "bi-puzzle" : "bi-journal"}`}></i>
                            {item.isPublic ? "(Public)" : "(Yours)"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}


          </header>


          {/* WingPanel (Hidden by default, appears when clicking the hamburger) */}
          {isWingPanelOpen && (
            <WingPanel
              isOpen={isWingPanelOpen}
              setIsOpen={setIsWingPanelOpen}
              setIsCreatePuzzle={setIsCreatePuzzle}
              setIsCreatingSet={setIsCreatingSet}
              setSelectedSet={setSelectedSet}
              setIsEditingSet={setIsEditingSet}
              setIsHome={setIsHome}
              isHome={isHome}
              isCreatingSet={isCreatingSet}
              isCreatePuzzle={isCreatePuzzle}
              t={t}
              setShowGenerator={setShowGenerator}
            />

          )}

          {/*MobileNav trigger when width <= 480px */}
          {screenWidth <= 480 && (
            <MobileNav
              t={t}
              setIsHome={setIsHome}
              setIsCreatingSet={setIsCreatingSet}
              setIsCreatePuzzle={setIsCreatePuzzle}
              setSelectedSet={setSelectedSet}
              setIsEditingSet={setIsEditingSet}
              needLogin={needLogin}
              setShowGenerator={setShowGenerator}
              isHome={isHome}
              isCreatingSet={isCreatingSet}
              isCreatePuzzle={isCreatePuzzle}
            />
          )}


          {/* Main Container with Sidebar & Content */}
          <div
            className="flex flex-1 relative pt-[88px]"
            style={{
              paddingBottom: screenWidth <= 480 ? "64px" : undefined,
              paddingTop: screenWidth <= 660 ? "145px" : undefined,
              paddingLeft: screenWidth > 770 ? (isMenuCollapsed ? "84px" : "203px") : undefined,
            }}
          >
            {/* Side Navigation */}
            <aside
              className={`fixed top-[88px] left-0 z-40 bg-black/50 backdrop-blur-md p-4 border border-[#00e0ff] rounded-3xl shadow-lg
                ${screenWidth <= 770 ? "hidden" : isMenuCollapsed ? "w-[68px]" : "w-[190px]"}`}
              style={{ height: "calc(100vh - 88px)" }} // 88px top + 8px bottom margin
            >

              <nav className="flex flex-col gap-4">
                <button
                  onClick={() => {
                    setIsCreatingSet(false);
                    setIsHome(true);
                    setIsCreatePuzzle(false);
                    setIsEditingSet(null);
                    const tip = studyTips[Math.floor(Math.random() * studyTips.length)];
                    setRandomTip(tip);
                    setSelectedSet(null);
                    setShowGenerator(false);
                  }}
                  className={`flex items-center gap-2 px-2 py-1 rounded-3xl transition duration-300
                    ${isHome
                      ? "text-black bg-[#ff7700] border border-[#ff7700] drop-shadow-[0_0_8px_#ff7700]"
                      : "text-[#00e0ff] border border-[#00e0ff] hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff]"
                    }`}

                >
                  <i className="bi bi-house-door"></i> {!isMenuCollapsed && t.home}
                </button>
                <button
                  onClick={() => {
                    setSelectedSet(null);
                    if (isCreatingSet !== "library") {
                      setIsCreatingSet("library");
                    }
                    setIsCreatePuzzle(false);
                    setIsHome(false);
                    setShowGenerator(false);
                  }}
                  className={`flex items-center gap-2 px-2 py-1 rounded-3xl transition duration-300
                    ${isCreatingSet === "library"
                      ? "text-black bg-[#ff7700] border border-[#ff7700] drop-shadow-[0_0_8px_#ff7700]"
                      : "text-[#00e0ff] border border-[#00e0ff] hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff]"
                    }`}

                >
                  <i className="bi bi-folder2"></i> {!isMenuCollapsed && t.library}
                </button>

                <hr className="border-[#00e0ff]" />
                <p className={`text-sm  text-[#00e0ff] drop-shadow-[0_0_8px_#00e0ff] ${isMenuCollapsed ? "hidden" : "block"}`}>{t.yourFolders}</p>
                <button
                  onClick={() => {
                    setIsCreatingSet(false);
                    setSelectedSet(null);
                    setIsHome(false);
                    setIsCreatePuzzle(false);
                    setShowGenerator(false);
                  }}
                  className={`flex items-center gap-2 px-2 py-1 rounded-3xl transition duration-300
                    ${isCreatingSet === "folder"
                      ? "text-black bg-[#ff7700] border border-[#ff7700] drop-shadow-[0_0_8px_#ff7700]"
                      : "text-[#00e0ff] border border-[#00e0ff] hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff]"
                    }`}
                >
                  <i className="bi bi-plus"></i> {!isMenuCollapsed && t.createfolder}
                </button>
                <hr className="border-[#00e0ff]" />
                <p className={`text-sm  text-[#00e0ff] drop-shadow-[0_0_8px_#00e0ff] ${isMenuCollapsed ? "hidden" : "block"}`}>{t.explore}</p>
                <button
                  onClick={() => {

                    setIsCreatePuzzle(true);
                    setIsCreatingSet(false);
                    setSelectedSet(null);
                    setIsHome(false);
                  }}
                  className={`flex items-center gap-2 px-2 py-1 rounded-3xl transition duration-300
                    ${isCreatePuzzle
                      ? "text-black bg-[#ff7700] border border-[#ff7700] drop-shadow-[0_0_8px_#ff7700]"
                      : "text-[#00e0ff] border border-[#00e0ff] hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff]"
                    }`}

                >
                  <i className="bi bi-puzzle"></i> {!isMenuCollapsed && t.playcrossword}
                </button>
              </nav>
            </aside>


            {/* Main Content Area */}
            <main
              className="flex-1 p-3 overflow-hidden relative border border-[#00e0ff] rounded-3xl"
              style={{
                marginRight: screenWidth > 1000 && isHome ? "250px" : "0",
              }}
            >
              <div className="h-full overflow-y-auto">
                {isCreatingSet === "library" ? (
                  <LibraryContent
                    studySets={studySets}
                    setStudySets={setStudySets}
                    screenWidth={screenWidth}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    setIsEditingSet={setIsEditingSet}
                    setIsCreatingSet={setIsCreatingSet}
                    selectedSet={selectedSet}
                    setSelectedSet={setSelectedSet}
                    setIsHome={setIsHome}
                    t={t}
                    starredTerms={starredTerms}
                    toggleStar={toggleStar}
                    puzzleSets={puzzleSets}
                    setPuzzleSets={setPuzzleSets}
                    needLogin={needLogin}
                    isLoadingSets={isLoadingSets}
                    refreshPuzzleFlag={refreshPuzzleFlag}
                    setRefreshPuzzleFlag={setRefreshPuzzleFlag}
                    setPublicPuzzleSets={setPublicPuzzleSets}
                    setPublicSets={setPublicSets}

                  />
                ) : isEditingSet ? (
                  <EditSet
                    studySet={isEditingSet}
                    setStudySets={setStudySets}
                    t={t}
                    setSelectedSet={setSelectedSet}
                    onSave={(updatedSet) => {
                      setStudySets(
                        studySets.map((set) =>
                          set.title === isEditingSet.title ? updatedSet : set
                        )
                      );
                      setIsEditingSet(null); // Exit edit mode
                      setIsCreatingSet(false);
                      setSelectedSet(updatedSet);
                    }}
                    onCancel={() => setIsEditingSet(null)}
                  />

                ) : isCreatingSet ? (
                  <CreateSet
                    t={t}
                    onSave={(newSet) => {
                      setStudySets([...studySets, newSet]);
                      setIsCreatingSet(false);
                    }}
                  />
                ) : showGenerator === "play" && selectedPuzzle ? (
                  <CrosswordPuzzlePage
                    t={t}
                    screenWidth={screenWidth}
                    puzzleSet={selectedPuzzle}
                    onBack={() => {
                      setSelectedPuzzle(null);
                      setIsCreatePuzzle(false);
                      setIsHome(true);
                      setShowGenerator(false);
                    }}
                  />
                ) : showGenerator ? (
                  <GeneratePuzzle
                    t={t}
                    screenWidth={screenWidth}
                    onBack={() => setShowGenerator(false)}
                    onSaveStudySet={(newPuzzleSet) => {
                      const updatedPuzzleSets = [...puzzleSets, newPuzzleSet];
                      localStorage.setItem("myPuzzleSets", JSON.stringify(updatedPuzzleSets));
                      setPuzzleSets(updatedPuzzleSets);
                      setShowGenerator(false);
                      setIsCreatePuzzle(true);
                    }}
                  />
                ) : isCreatePuzzle ? (
                  showGenerator === "play" && selectedPuzzle ? (
                    <PuzzlePage
                      screenWidth={screenWidth}
                      setShowGenerator={setShowGenerator}
                      showGenerator={showGenerator}
                      setSelectedPuzzle={setSelectedPuzzle}
                      studySets={studySets}
                      setStudySets={setStudySets}
                      t={t}
                      publicPuzzleSets={publicPuzzleSets}
                      username={username}
                      setPublicPuzzleSets={setPublicPuzzleSets}
                      needLogin={needLogin}
                      puzzleSets={puzzleSets}
                      setPuzzleSets={setPuzzleSets}
                      setIsHome={setIsHome}
                      isLoadingSets={isLoadingPuzzles}
                      refreshPuzzleFlag={refreshPuzzleFlag}
                    />
                  ) : (
                    <PuzzlePage
                      screenWidth={screenWidth}
                      setShowGenerator={setShowGenerator}
                      showGenerator={showGenerator}
                      setSelectedPuzzle={setSelectedPuzzle}
                      setStudySets={setStudySets}
                      t={t}
                      publicPuzzleSets={publicPuzzleSets}
                      username={username}
                      setPublicPuzzleSets={setPublicPuzzleSets}
                      needLogin={needLogin}
                      puzzleSets={puzzleSets}
                      setPuzzleSets={setPuzzleSets}
                      setIsHome={setIsHome}
                      isLoadingSets={isLoadingPuzzles}
                      refreshPuzzleFlag={refreshPuzzleFlag}
                    />

                  )
                ) : (
                  <HomeContent
                    studySets={studySets}
                    publicSets={publicSets}
                    screenWidth={screenWidth}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    setIsEditingSet={setIsEditingSet}
                    setIsCreatingSet={setIsCreatingSet}
                    selectedSet={selectedSet}
                    setSelectedSet={setSelectedSet}
                    setIsHome={setIsHome}
                    username={username}
                    setPublicSets={setPublicSets}
                    needLogin={needLogin}
                    t={t}
                    setStudySets={setStudySets}
                    starredTerms={starredTerms}
                    toggleStar={toggleStar}
                    isLoadingSets={isLoadingSets}
                  />

                )}
              </div>
            </main>

            {/* Right Panel (Hidden on small screens OR when creating a set) */}
            {screenWidth > 1000 && isHome && (
              <aside
                className="fixed top-[88px] right-0 z-40 w-[240px] h-[calc(100vh-88px)] bg-black/50 backdrop-blur-md p-4 border border-[#00e0ff] rounded-3xl shadow-lg"
              >
                <h3 className="flex items-center gap-2 text-lg font-semibold text-[#00e0ff] drop-shadow-[0_0_8px_#00e0ff]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-lightbulb" viewBox="0 0 16 16">
                    <path d="M2 6a6 6 0 1 1 10.174 4.31c-.203.196-.359.4-.453.619l-.762 1.769A.5.5 0 0 1 10.5 13a.5.5 0 0 1 0 1 .5.5 0 0 1 0 1l-.224.447a1 1 0 0 1-.894.553H6.618a1 1 0 0 1-.894-.553L5.5 15a.5.5 0 0 1 0-1 .5.5 0 0 1 0-1 .5.5 0 0 1-.46-.302l-.761-1.77a2 2 0 0 0-.453-.618A5.98 5.98 0 0 1 2 6m6-5a5 5 0 0 0-3.479 8.592c.263.254.514.564.676.941L5.83 12h4.342l.632-1.467c.162-.377.413-.687.676-.941A5 5 0 0 0 8 1" />
                  </svg>
                  {t.flashcardTip}
                </h3>

                <p className="text-sm mt-2 text-[#00e0ff] drop-shadow-[0_0_8px_#00e0ff] opacity-80">
                  {randomTip}
                </p>
              </aside>
            )}

          </div>
        </div >
      )
      }
      {
        showNeedLogin && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
            <div className="bg-black p-6 rounded-3xl text-white border border-[#00e0ff] shadow-[0_0_16px_#00e0ff] w-[350px]">
              <h2 className="text-2xl font-bold mb-4 text-[#ff7700] drop-shadow-[0_0_8px_#ff7700] text-center">
                {t.needlogin}
              </h2>
              <p className="text-center text-[#00e0ff] mb-6">
                {t.needloginlog}
              </p>

              <div className="flex justify-center gap-4">
                <button
                  className="px-6 py-2 rounded-3xl border border-[#00e0ff] text-[#00e0ff] hover:bg-[#00e0ff] hover:text-black transition duration-300 shadow-md hover:shadow-[0_0_12px_#00e0ff]"
                  onClick={() => {
                    setShowNeedLogin(false);
                  }}
                >
                  {t.cancelbtn}
                </button>
                <button
                  className="px-6 py-2 rounded-3xl border border-[#00e0ff] text-[#00e0ff] hover:bg-[#00e0ff] hover:text-black transition duration-300 shadow-md hover:shadow-[0_0_12px_#00e0ff]"
                  onClick={() => {
                    setShowNeedLogin(false);
                    setShowLogin(true);
                  }}
                >
                  {t.login}
                </button>
              </div>
            </div>
          </div>
        )
      }
    </DndProvider >
  );
}






/* Component: Home Content */
function HomeContent({ isLoadingSets, starredTerms, toggleStar, setStudySets, needLogin, setPublicSets, username, studySets, screenWidth, isEditing, setIsEditing, setIsEditingSet, setIsCreatingSet, selectedSet, setSelectedSet, setIsHome, publicSets, t }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
  const [clickedHeartId, setClickedHeartId] = useState(null);

  useEffect(() => {
    async function refreshSets() {
      try {
        const username = localStorage.getItem("username");
        if (username) {
          const updated = await getStudySets(username);
          setStudySets(updated);
        }
      } catch (err) {
        console.error("❌ Failed to refresh study sets:", err);
      }
    }
    refreshSets();
  }, []); // run once when HomeContent mounts


  // If a set is selected, show flashcard review instead of library
  if (selectedSet) {
    return (
      <FlashcardReview
        t={t}
        studySets={studySets}
        studySet={selectedSet}
        onExit={() => setSelectedSet(null)}
        screenWidth={screenWidth}
        starredTerms={starredTerms}
        toggleStar={toggleStar}
        isEditing={isEditing}
        setIsEditing={setIsEditing} // 🔹 Pass this down
        setIsEditingSet={setIsEditingSet} // 🔹 Pass the function as a prop
        setIsCreatingSet={setIsCreatingSet}
        setStudySets={setStudySets}
        needLogin={needLogin}
      />
    );
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4 text-[#00e0ff] drop-shadow-[0_0_8px_#00e0ff]">{t.recentfile}</h2>
      {isLoadingSets ? (
        <div className="flex justify-center items-center py-10">
          <i className="bi bi-arrow-repeat animate-spin text-3xl text-[#00e0ff] drop-shadow-[0_0_8px_#00e0ff]"></i>
        </div>
      ) : studySets.length > 0 ? (
        <div className="flex flex-col gap-4"> {/* 🔥 Add this flex column with gap */}
          {studySets.map((studySet, index) => (
            <div
              key={index}
              onClick={() => {
                setSelectedSet(studySet);
                setIsHome(false);
              }}
              className="flex flex-col gap-1 w-3/4 max-w-[400px] px-4 py-2 rounded-3xl transition duration-300 text-[#00e0ff] border border-[#00e0ff] shadow-[0_0_20px_#00e0ff] hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff] cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <i className="bi bi-folder2"></i> {studySet.title} ({studySet.terms.length}{studySet.terms.length === 1 ? " " + t.termsg : " " + t.termmul})
              </div>

              {/* 🔥 Glow white text + orange username */}
              <div className="text-sm pl-6">
                <span className="text-white  font-semibold">{t.createby}</span>{" "}
                <span className="text-[#ff7700] drop-shadow-[0_0_8px_#ff7700] font-semibold">
                  {studySet.username}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[#ff7700] drop-shadow-[0_0_8px_#ff7700]">{t.noFolders}</p>
      )}

      {/* 🟡 Public Sets Section */}
      <h2 className="text-lg font-semibold mt-10 mb-4 text-[#00e0ff] drop-shadow-[0_0_8px_#00e0ff]">{t.otherpeopleset}</h2>
      {isLoadingSets ? (
        <div className="flex justify-center items-center py-10">
          <i className="bi bi-arrow-repeat animate-spin text-3xl text-[#00e0ff] drop-shadow-[0_0_8px_#00e0ff]"></i>
        </div>
      ) : publicSets.length > 0 ? (
        <div className="flex flex-col gap-4">
          {publicSets.map((publicSet, index) => (
            <div
              key={index}
              onClick={() => {
                setSelectedSet(publicSet);
                setIsHome(false);
              }}
              className="flex justify-between items-center gap-2 w-3/4 max-w-[400px] px-4 py-2 rounded-3xl transition duration-300 text-[#00e0ff] border border-[#00e0ff] shadow-[0_0_20px_#00e0ff] hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff] cursor-pointer"
            >
              {/* 📂 Folder Info Column */}
              <div className="flex flex-col gap-1 max-w-[80%]">
                <div className="flex items-center gap-2">
                  <i className="bi bi-folder2"></i>
                  {publicSet.title} ({publicSet.terms.length} {publicSet.terms.length === 1 ? t.termsg : t.termmul})
                </div>
                <div className="text-sm pl-6">
                  <span className="text-white font-semibold">{t.createby}</span>{" "}
                  <span className="text-[#ff7700] drop-shadow-[0_0_8px_#ff7700] font-semibold">
                    {publicSet.username}
                  </span>
                </div>
              </div>

              {/* ❤️ Heart Column */}
              <div
                className="flex items-center gap-2 text-2xl cursor-pointer transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  needLogin(async () => {
                    setClickedHeartId(publicSet._id);
                    setTimeout(() => setClickedHeartId(null), 200);
                    try {
                      await toggleLikeSet(publicSet._id, username);
                      const updatedPublicSets = await getPublicSets();
                      setPublicSets(updatedPublicSets);
                    } catch (error) {
                      console.error('Error toggling like:', error);
                    }
                  });
                }}
              >
                <div
                  className={`flex items-center justify-center rounded-full p-2 border-2 ${publicSet.likes && publicSet.likes.includes(username)
                    ? "border-red-500"
                    : "border-[#ff7700]"
                    } ${clickedHeartId === publicSet._id ? "scale-125" : "scale-100"} 
                 transition-transform duration-200`}
                  style={{ width: "40px", height: "40px" }}
                >
                  <i
                    className={`bi ${publicSet.likes && publicSet.likes.includes(username)
                      ? "bi-heart-fill text-red-500 drop-shadow-[0_0_8px_red]"
                      : "bi-heart text-[#ff7700]"
                      }`}
                    style={{ paddingTop: "3px" }}
                  ></i>
                </div>
                <span
                  className={`text-sm ${publicSet.likes && publicSet.likes.includes(username)
                    ? "text-red-500"
                    : "text-[#ff7700]"
                    }`}
                >
                  {publicSet.likes ? publicSet.likes.length : 0}
                </span>
              </div>
            </div>

          ))}
        </div>
      ) : (
        <p className="text-[#ff7700] drop-shadow-[0_0_8px_#ff7700]">{t.nopublicsets}</p>
      )
      }
      {/* Display All Study Sets */}
    </section >
  );
}





function LibraryContent({ setPublicSets, setPublicPuzzleSets, refreshPuzzleFlag, setRefreshPuzzleFlag, isLoadingSets, needLogin, starredTerms, toggleStar, puzzleSets, setPuzzleSets, studySets, screenWidth, isEditing, setIsEditing, setIsEditingSet, setIsCreatingSet, selectedSet, setSelectedSet, setIsHome, setStudySets, t }) {
  const [isManaging, setIsManaging] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  const togglePrivatePublic = async (index) => {
    try {
      const updatedSets = [...studySets];
      updatedSets[index].isPrivate = updatedSets[index].isPrivate === "Private" ? "Public" : "Private";
      setStudySets(updatedSets);

      const studySet = updatedSets[index];
      const payload = { isPrivate: studySet.isPrivate };
      await updateStudySet(studySet._id, payload);

      // ✅ Re-fetch public sets
      const updatedPublicSets = await getPublicSets();
      setPublicSets(updatedPublicSets);
    } catch (error) {
      console.error("❌ Failed to update isPrivate:", error);
    }
  };



  const handleDeleteStudySet = async (index) => {
    const studySetId = studySets[index]._id;
    try {
      await deleteStudySet(studySetId);

      // Update local state
      const updatedSets = [...studySets];
      updatedSets.splice(index, 1);
      setStudySets(updatedSets);

      // ✅ Re-fetch public sets
      const updatedPublicSets = await getPublicSets();
      setPublicSets(updatedPublicSets);
    } catch (error) {
      console.error('Failed to delete study set:', error);
    }
  };


  // --- Functions for PuzzleSets ---
  const handleDeletePuzzleSet = async (index) => {
    const puzzleSetId = puzzleSets[index]._id;
    try {
      await deletePuzzleSet(puzzleSetId);
      setRefreshPuzzleFlag(prev => !prev);
      const updatedSets = [...puzzleSets];
      updatedSets.splice(index, 1);
      setPuzzleSets(updatedSets);

      // ✅ Move this here
      const updatedPublic = await getPublicPuzzleSets();
      setPublicPuzzleSets(updatedPublic);
    } catch (error) {
      console.error('Failed to delete puzzle set:', error);
    }

  };

  const togglePrivatePublicPuzzleSet = async (index) => {
    try {
      const updatedSets = [...puzzleSets];
      updatedSets[index].isPrivate = updatedSets[index].isPrivate === "Private" ? "Public" : "Private";
      setPuzzleSets(updatedSets);
      const puzzleSet = updatedSets[index];
      const payload = { isPrivate: puzzleSet.isPrivate };
      await updatePuzzleSet(puzzleSet._id, payload);
      setRefreshPuzzleFlag(prev => !prev);

      // ✅ Move this here
      const updatedPublic = await getPublicPuzzleSets();
      setPublicPuzzleSets(updatedPublic);
    } catch (error) {
      console.error("Failed to update puzzle set privacy:", error);
    }

  };

  // If a set is selected, show flashcard review instead of library
  if (selectedSet) {
    // Check if it's a puzzle set (you can use a flag or fallback to .terms + title structure)
    const isPuzzle = puzzleSets.some(p => p._id === selectedSet._id);

    if (isPuzzle) {
      return (
        <GeneratePuzzle
          t={t}
          screenWidth={screenWidth}
          onBack={() => {
            setSelectedSet(null);
            setIsHome(true);
          }}
          existingSet={selectedSet} // ⬅️ Pass the puzzle to pre-fill fields
          onSaveStudySet={(updatedSet) => {
            const updated = puzzleSets.map(p =>
              p._id === updatedSet._id ? updatedSet : p
            );
            setPuzzleSets(updated);
            setSelectedSet(null);
            setIsHome(true);
          }}
        />
      );
    }
    return (
      <FlashcardReview
        t={t}
        studySets={studySets}
        studySet={selectedSet}
        onExit={() => setSelectedSet(null)}
        screenWidth={screenWidth}
        starredTerms={starredTerms}
        toggleStar={toggleStar}
        isEditing={isEditing}
        setIsEditing={setIsEditing} // 🔹 Pass this down
        setIsEditingSet={setIsEditingSet} // 🔹 Pass the function as a prop
        setIsCreatingSet={setIsCreatingSet}
        setStudySets={setStudySets}
        needLogin={needLogin}
      />
    );
  }
  return (
    <section>
      <div className="flex items-center gap-4 mb-4">
        <h2 className="text-lg font-semibold text-[#00e0ff] drop-shadow-[0_0_8px_#00e0ff]">
          {t.yourlibrary}
        </h2>

        <button
          onClick={() => setIsManaging(!isManaging)}
          className="px-4 py-2 border-2 border-[#ff7700] text-[#ff7700] rounded-3xl hover:bg-[#ff7700] hover:text-black shadow-[0_0_8px_#ff7700] hover:shadow-[0_0_12px#ff7700] transition duration-300 font-bold"
        >
          {isManaging ? t.doneManaging : t.manageLibrary}
        </button>

      </div>
      {isLoadingSets ? (
        <div className="flex justify-center items-center py-10">
          <i className="bi bi-arrow-repeat animate-spin text-3xl text-[#00e0ff] drop-shadow-[0_0_8px_#00e0ff]"></i>
        </div>
      ) : studySets.length > 0 ? (
        studySets.map((studySet, index) => (
          <div key={index} className="flex items-center justify-start gap-2 w-full max-w-[600px] mb-4">
            {/* Folder Box */}
            <div
              onClick={() => {
                if (!isManaging) {
                  setSelectedSet(studySet);
                  setIsHome(false);
                }
              }}
              className="flex items-center w-3/4 max-w-[400px] px-4 py-2 rounded-3xl transition duration-300 text-[#00e0ff] border border-[#00e0ff] shadow-[0_0_20px_#00e0ff] hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff] cursor-pointer"
            >
              {/* Column 1: Folder Icon */}
              <i className="bi bi-folder2 text-xl mr-2" />

              {/* Column 2: Full Title & Term Count */}
              <span className="text-sm">
                {studySet.title} ({studySet.terms.length}{" "}
                {studySet.terms.length === 1 ? t.termsg : t.termmul})
              </span>

              {/* Column 3: Heart aligned right */}
              <div className="flex items-center gap-1 ml-auto text-xl">
                <i
                  className={`bi ${studySet.likes?.length > 0
                    ? "bi-heart-fill text-[#00e0ff] drop-shadow-[0_0_6px_#00e0ff]"
                    : "bi-heart text-[#00e0ff] drop-shadow-[0_0_6px_#00e0ff]"
                    }`}
                  style={{ paddingTop: "2px" }}
                ></i>
                <span className="text-xs text-[#00e0ff] drop-shadow-[0_0_6px_#00e0ff]">
                  {studySet.likes?.length || 0}
                </span>
              </div>
            </div>

            {/* Manage Buttons */}
            {isManaging && (
              <div className="flex gap-2">
                {/* Trash Box */}
                <button
                  onClick={() => handleDeleteStudySet(index)}
                  className="flex items-center justify-center w-10 h-10 rounded-3xl border border-red-500 text-red-500 drop-shadow-[0_0_8px_red] transition duration-300 hover:scale-110"
                >
                  <i className="bi bi-trash"></i>
                </button>

                {/* Lock/Unlock Box */}
                {studySet.isPrivate === "Copy" ? (
                  <div
                    className="flex items-center justify-center w-20 h-10 rounded-3xl border-2 border-[#00e0ff] text-[#00e0ff] drop-shadow-[0_0_8px_#00e0ff] font-bold cursor-default"
                  >
                    Copied
                  </div>
                ) : (
                  <button
                    onClick={() => togglePrivatePublic(index)}
                    className={`flex items-center justify-center w-20 h-10 rounded-3xl border transition duration-300 hover:scale-110 font-bold
                       ${studySet.isPrivate === "Private"
                        ? "border-green-400 text-green-400 drop-shadow-[0_0_8px_#00ff00]"
                        : "border-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_yellow]"
                      }
                    `}
                  >
                    {studySet.isPrivate === "Private" ? "Private" : "Public"}
                  </button>
                )}

              </div>
            )}
          </div>
        ))
      ) : (
        <p className="text-[#ff7700] ">{t.noFolders}</p>
      )}
      <h2 className="text-lg font-bold text-[#00e0ff] drop-shadow-[0_0_8px_#00e0ff] mt-8 mb-2">{t.puzzlesets}</h2>
      {isLoadingSets ? (
        <div className="flex justify-center items-center py-10">
          <i className="bi bi-arrow-repeat animate-spin text-3xl text-[#00e0ff] drop-shadow-[0_0_8px_#00e0ff]"></i>
        </div>
      ) : puzzleSets.length > 0 ? (
        puzzleSets.map((puzzleSet, index) => (
          <div key={index} className="flex items-center justify-start gap-2 w-full max-w-[600px] mb-4">
            {/* PuzzleSet card */}
            <div
              onClick={() => {
                if (!isManaging) {
                  setSelectedSet(puzzleSet);
                  setIsHome(false);
                }
              }}
              className="flex items-center w-3/4 max-w-[400px] px-4 py-2 rounded-3xl transition duration-300 text-[#00e0ff] border border-[#00e0ff] shadow-[0_0_20px_#00e0ff] hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff] cursor-pointer"
            >
              {/* Column 1: Folder Icon */}
              <i className="bi bi-folder2 text-xl mr-2" />

              {/* Column 2: Full Title & Term Count */}
              <span className="text-sm">
                {puzzleSet.title} ({puzzleSet.terms.length}{" "}
                {puzzleSet.terms.length === 1 ? t.termsg : t.termmul})
              </span>

              {/* Column 3: Heart aligned right */}
              <div className="flex items-center gap-1 ml-auto text-xl">
                <i
                  className={`bi ${puzzleSet.likes?.length > 0
                    ? "bi-puzzle-fill text-[#00e0ff] drop-shadow-[0_0_6px_#00e0ff]"
                    : "bi-puzzle text-[#00e0ff] drop-shadow-[0_0_6px_#00e0ff]"
                    }`}
                  style={{ paddingTop: "1px" }}
                ></i>
                <span className="text-xs text-[#00e0ff] drop-shadow-[0_0_6px_#00e0ff]">
                  {puzzleSet.likes?.length || 0}
                </span>
              </div>
            </div>


            {isManaging && (
              <div className="flex gap-2">
                {/* Delete Puzzle */}
                <button
                  onClick={() => handleDeletePuzzleSet(index)}
                  className="flex items-center justify-center w-10 h-10 rounded-3xl border border-red-500 text-red-500 drop-shadow-[0_0_8px_red] transition duration-300 hover:scale-110"
                >
                  <i className="bi bi-trash"></i>
                </button>

                {/* Toggle Puzzle Privacy */}
                {/* Lock/Unlock Box */}
                {puzzleSet.isPrivate === "Copy" ? (
                  <div
                    className="flex items-center justify-center w-20 h-10 rounded-3xl border-2 border-[#00e0ff] text-[#00e0ff] drop-shadow-[0_0_8px_#00e0ff] font-bold cursor-default"
                  >
                    Copied
                  </div>
                ) : (
                  <button
                    onClick={() => togglePrivatePublicPuzzleSet(index)}
                    className={`flex items-center justify-center w-20 h-10 rounded-3xl border transition duration-300 hover:scale-110 font-bold
                       ${puzzleSet.isPrivate === "Private"
                        ? "border-green-400 text-green-400 drop-shadow-[0_0_8px_#00ff00]"
                        : "border-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_yellow]"
                      }
                    `}
                  >
                    {puzzleSet.isPrivate === "Private" ? "Private" : "Public"}
                  </button>
                )}
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="text-[#ff7700]">{t.nopuzzle}</p>
      )}
    </section>
  );
}





function WingPanel({ isOpen, setIsOpen, setIsCreatePuzzle, setSelectedSet, setIsCreatingSet, setIsHome, setIsEditingSet, isHome, isCreatingSet, isCreatePuzzle, t, setShowGenerator }) {
  return (
    <motion.aside
      className="fixed top-0 left-0 h-full w-48 bg-black/50 backdrop-blur-md p-4 z-50 border border-[#00e0ff] rounded-3xl shadow-lg"
      initial={{ x: -200 }}
      animate={{ x: isOpen ? 0 : -200 }}
      transition={{ duration: 0.3 }}
    >
      {/* BigMac Button & Logo */}
      <div className="flex items-center gap-1">
        <button
          className="text-[#00e0ff] text-2xl focus:outline-none w-9 h-9 flex items-center justify-center rounded-full transition duration-300 hover:border hover:border-[#00e0ff] hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff]"
          onClick={() => setIsOpen(false)}
        >
          ☰
        </button>
        <img
          src="/logo5.png"
          alt="Hippocampus Logo"
          className="h-10 w-15 object-contain ml-1"
        />
      </div>

      {/* Navigation Items */}
      <nav className="flex flex-col gap-4 mt-6">
        {/* Home */}
        <button
          onClick={() => {
            setIsCreatingSet(false);
            setIsHome(true);
            setIsCreatePuzzle(false);
            setIsEditingSet(null);
            setSelectedSet(null);
            setIsOpen(false);
            setShowGenerator(false);
          }}
          className={`flex items-center gap-2 px-2 py-1 rounded-3xl transition duration-300 ${isHome
            ? "text-black bg-[#ff7700] border border-[#ff7700] drop-shadow-[0_0_8px_#ff7700]"
            : "text-[#00e0ff] border border-[#00e0ff] hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff]"
            }`}
        >
          <i className="bi bi-house-door"></i> {t.home}
        </button>

        {/* Library */}
        <button
          onClick={() => {
            setSelectedSet(null);
            setIsCreatingSet("library");
            setIsCreatePuzzle(false);
            setIsHome(false);
            setIsOpen(false);
            setShowGenerator(false);
          }}
          className={`flex items-center gap-2 px-2 py-1 rounded-3xl transition duration-300 ${isCreatingSet === "library"
            ? "text-black bg-[#ff7700] border border-[#ff7700] drop-shadow-[0_0_8px_#ff7700]"
            : "text-[#00e0ff] border border-[#00e0ff] hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff]"
            }`}
        >
          <i className="bi bi-folder2"></i> {t.library}
        </button>

        <hr className="border-[#00e0ff]" />
        <p className="text-sm text-[#00e0ff] drop-shadow-[0_0_8px_#00e0ff]">{t.yourFolders}</p>

        {/* Create Folder (if you use a "folder" flag) */}
        <button
          onClick={() => {
            setIsCreatingSet("folder");
            setSelectedSet(null);
            setIsHome(false);
            setIsCreatePuzzle(false);
            setIsOpen(false);
            setShowGenerator(false);
          }}
          className={`flex items-center gap-2 px-2 py-1 rounded-3xl transition duration-300 ${isCreatingSet === "folder"
            ? "text-black bg-[#ff7700] border border-[#ff7700] drop-shadow-[0_0_8px_#ff7700]"
            : "text-[#00e0ff] border border-[#00e0ff] hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff]"
            }`}
        >
          <i className="bi bi-plus"></i> {t.createfolder}
        </button>

        <hr className="border-[#00e0ff]" />
        <p className="text-sm text-[#00e0ff] drop-shadow-[0_0_8px_#00e0ff]">{t.explore}</p>

        {/* Play Crossword */}
        <button
          onClick={() => {
            setIsCreatePuzzle(true);
            setIsCreatingSet(false);
            setSelectedSet(null);
            setIsHome(false);
            setIsOpen(false);
          }}
          className={`flex items-center gap-2 px-2 py-1 rounded-3xl transition duration-300 ${isCreatePuzzle
            ? "text-black bg-[#ff7700] border border-[#ff7700] drop-shadow-[0_0_8px_#ff7700]"
            : "text-[#00e0ff] border border-[#00e0ff] hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff]"
            }`}
        >
          <i className="bi bi-puzzle"></i> {t.playcrossword}
        </button>
      </nav>
    </motion.aside>
  );
}



function PuzzlePage({ refreshPuzzleFlag, isLoadingSets, needLogin, screenWidth, setIsHome, setShowGenerator, showGenerator, setSelectedPuzzle, puzzleSets, setPuzzleSets, publicPuzzleSets, setPublicPuzzleSets, username, t }) {
  const [showCrosswordPuzzle, setShowCrosswordPuzzle] = useState(false);
  const [selectedSet, setSelectedSet] = useState(null);
  const [clickedHeartId, setClickedHeartId] = useState(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  useEffect(() => {
    async function refreshPuzzles() {
      const username = localStorage.getItem("username");
      if (username) {
        const updated = await getPuzzleSets(username);
        setPuzzleSets(updated);
      }
    }
    refreshPuzzles();
  }, [refreshPuzzleFlag]);


  if (showGenerator) {
    return (
      <GeneratePuzzle
        t={t}
        screenWidth={screenWidth}
        onBack={() => setShowGenerator(false)}
        onSaveStudySet={(newPuzzleSet) => {
          const updatedPuzzleSets = [...puzzleSets, newPuzzleSet];
          localStorage.setItem("myPuzzleSets", JSON.stringify(updatedPuzzleSets));
          setPuzzleSets(updatedPuzzleSets);
        }}
      />
    );
  }

  if (showCrosswordPuzzle && selectedSet) {
    return (
      <CrosswordPuzzlePage
        t={t}
        screenWidth={screenWidth}
        puzzleSet={selectedSet}
        onBack={() => {
          setShowCrosswordPuzzle(false);
          setSelectedSet(null);
        }}
      />
    );
  }

  return (
    <section>
      {/* Your Puzzle Section */}
      <div className="flex items-center gap-5 mb-4">
        <h2 className="text-lg font-semibold mb-4 text-[#00e0ff] drop-shadow-[0_0_8px_#00e0ff]">{t.playpuzzle}</h2>
        <button
          onClick={() => {
            needLogin(() => {
              setShowGenerator(true);
            });
          }}
          className="px-4 py-2 rounded-3xl border border-[#ff7700] text-[#ff7700] hover:bg-[#ff7700] hover:text-black transition duration-300 shadow-md hover:shadow-[0_0_12px_#ff7700]"
        >
          {t.createyourpuzzle}
        </button>

      </div>

      {/* Your Created Puzzle Sets */}
      {puzzleSets.length > 0 ? (
        <div className="flex flex-col gap-4">
          {isLoadingSets ? (
            <div className="flex justify-center items-center py-10">
              <i className="bi bi-arrow-repeat animate-spin text-3xl text-[#00e0ff] drop-shadow-[0_0_8px_#00e0ff]"></i>
            </div>
          ) : puzzleSets.map((puzzleSet, index) => (
            <div
              key={index}
              onClick={() => {
                setSelectedSet(puzzleSet);
                setShowCrosswordPuzzle(true);
                setIsHome(false);
              }}
              className="flex flex-col gap-1 w-3/4 max-w-[400px] px-4 py-2 rounded-3xl transition duration-300 text-[#00e0ff] border border-[#00e0ff] shadow-[0_0_20px_#00e0ff] hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff] cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <i className="bi bi-folder2"></i> {puzzleSet.title} ({puzzleSet.terms.length}{puzzleSet.terms.length === 1 ? " " + t.termsg : " " + t.termmul})
              </div>

              {/* 🔥 Glow white text + orange username */}
              <div className="text-sm pl-6">
                <span className="text-white font-semibold">{t.createby}</span>{" "}
                <span className="text-[#ff7700] drop-shadow-[0_0_8px_#ff7700] font-semibold">
                  {puzzleSet.username}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[#ff7700] drop-shadow-[0_0_8px_#ff7700]">{t.nopuzzle}</p>
      )}

      {/* Other People's Puzzle Section */}
      <h2 className="text-lg font-semibold mt-10 mb-4 text-[#00e0ff] ">{t.otherpuzzle}</h2>

      {publicPuzzleSets.length > 0 ? (
        <div className="flex flex-col gap-4">
          {isLoadingSets ? (
            <div className="flex justify-center items-center py-10">
              <i className="bi bi-arrow-repeat animate-spin text-3xl text-[#00e0ff] "></i>
            </div>
          ) : publicPuzzleSets.map((publicPuzzleSet, index) => (
            <div
              key={index}
              onClick={() => {
                setSelectedSet(publicPuzzleSet);
                setShowCrosswordPuzzle(true);
                setIsHome(false);
              }}

              className="flex justify-between items-center gap-2 w-3/4 max-w-[400px] px-4 py-2 rounded-3xl transition duration-300 text-[#00e0ff] border border-[#00e0ff] shadow-[0_0_20px_#00e0ff] hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff] cursor-pointer"
            >
              {/* 📂 Folder Title */}
              <div className="flex flex-col gap-1 max-w-[80%]">
                <div className="flex items-center gap-2">
                  <i className="bi bi-folder2"></i>
                  {publicPuzzleSet.title} ({publicPuzzleSet.terms.length}{publicPuzzleSet.terms.length === 1 ? " " + t.termsg : " " + t.termmul})
                </div>
                {/* 👤 Username */}
                <div className="text-sm pl-6">
                  <span className="text-white font-semibold">{t.createby}</span>{" "}
                  <span className="text-[#ff7700] drop-shadow-[0_0_8px_#ff7700] font-semibold">
                    {publicPuzzleSet.username}
                  </span>
                </div>
              </div>

              {/* ❤️ Heart Absolute */}
              <div
                className="flex items-center gap-2 text-2xl cursor-pointer transition-all duration-300"
                onClick={async (e) => {
                  e.stopPropagation();
                  setClickedHeartId(publicPuzzleSet._id);
                  setTimeout(() => setClickedHeartId(null), 200);

                  try {
                    await toggleLikePuzzleSet(publicPuzzleSet._id, username);
                    const updatedPublicPuzzleSets = await getPublicPuzzleSets();
                    setPublicPuzzleSets(updatedPublicPuzzleSets);
                  } catch (error) {
                    console.error('Error toggling like:', error);
                  }
                }}
              >
                <div
                  className={`flex items-center justify-center rounded-full p-2 border-2 ${publicPuzzleSet.likes && publicPuzzleSet.likes.includes(username)
                    ? "border-green-500"
                    : "border-[#ff7700]"
                    } ${clickedHeartId === publicPuzzleSet._id ? "scale-125" : "scale-100"} 
    transition-transform duration-200`}
                  style={{
                    width: "40px",
                    height: "40px",
                  }}
                >
                  <i
                    className={`bi ${publicPuzzleSet.likes && publicPuzzleSet.likes.includes(username)
                      ? "bi-puzzle-fill text-green-500 drop-shadow-[0_0_8px_green]"
                      : "bi-puzzle text-[#ff7700]"
                      }`}
                    style={{
                      paddingTop: "2px",
                    }}
                  ></i>
                </div>
                <span
                  className={`text-sm ${publicPuzzleSet.likes && publicPuzzleSet.likes.includes(username)
                    ? "text-green-500"
                    : "text-[#ff7700]"
                    }`}
                >
                  {publicPuzzleSet.likes ? publicPuzzleSet.likes.length : 0}
                </span>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <p className="text-[#ff7700] drop-shadow-[0_0_8px_#ff7700]">{t.nootherpuzzle}</p>
      )
      }
      {/* Display All Study Sets */}
    </section >
  );
}





function MobileNav({ t, setIsHome, setIsCreatingSet, setIsCreatePuzzle, setSelectedSet, setIsEditingSet, isHome, isCreatingSet, isCreatePuzzle, needLogin, setShowGenerator }) {
  const navBtnBase = "flex flex-col items-center justify-center flex-1 text-xs transition rounded-3xl py-1";
  const activeColor = "text-black bg-[#ff7700] ";
  const inactiveColor = "text-[#00e0ff]  hover:text-black hover:bg-[#00e0ff]";
  const [showPrompt, setShowPrompt] = useState(false);

  return (
    <>
      <div className="fixed bottom-0 left-0 w-full h-16 z-50 border-3 border-[#00e0ff] rounded-3xl backdrop-blur-md bg-black/50">
        {/* Navigation Buttons */}
        <div className="flex items-end justify-between h-full px-1 pb-2 ">

          {/* Home */}
          <button
            onClick={() => {
              setIsHome(true);
              setIsCreatingSet(false);
              setIsCreatePuzzle(false);
              setIsEditingSet(false);
              setSelectedSet(null);
              setShowGenerator(false);
            }}
            className={`${navBtnBase} ${isHome
              ? "text-[#ff7700] "
              : "text-[#00e0ff] hover:text-black hover:bg-[#00e0ff] "
              }`}
          >
            <i className="bi bi-house-door text-3xl" />
          </button>


          {/* Library */}
          <button
            onClick={() => {
              setIsHome(false);
              setIsCreatingSet("library");
              setIsCreatePuzzle(false);
              setIsEditingSet(false);
              setSelectedSet(null);
              setShowGenerator(false);
            }}
            className={`${navBtnBase} ${isCreatingSet === "library"
              ? "text-[#ff7700] "
              : "text-[#00e0ff] hover:text-black hover:bg-[#00e0ff] "
              }`}
          >
            <i className="bi bi-book text-3xl" />
          </button>


          {/* Center Plus Button */}
          <div className="relative -top-0 w-20 h-20 rounded-full border-4 border-[#00e0ff] bg-black mx-1 flex items-center justify-center drop-shadow-[0_0_12px_#00e0ff]">
            <button
              onClick={() => setShowPrompt(true)}
              className="text-[#00e0ff] text-3xl hover:text-black hover:bg-[#00e0ff] w-full h-full flex items-center justify-center transition rounded-full"
            >
              <i className="bi bi-plus-lg" />
            </button>

          </div>

          {/* Folder */}
          <button
            onClick={() => {
              setIsHome(false);
              setIsCreatingSet("folder");
              setIsCreatePuzzle(false);
              setIsEditingSet(false);
              setSelectedSet(null);
              setShowGenerator(false);
            }}
            className={`${navBtnBase} ${isCreatingSet === "folder"
              ? "text-[#ff7700] "
              : "text-[#00e0ff] hover:text-black hover:bg-[#00e0ff] "
              }`}
          >
            <i className="bi bi-folder2 text-3xl" />
          </button>


          {/* Crossword */}
          <button
            onClick={() => {
              setIsCreatePuzzle(true);
              setIsHome(false);
              setIsCreatingSet(false);
              setIsEditingSet(false);
              setSelectedSet(null);
            }}
            className={`${navBtnBase} ${isCreatePuzzle
              ? "text-[#ff7700] "
              : "text-[#00e0ff] hover:text-black hover:bg-[#00e0ff] "
              }`}
          >
            <i className="bi bi-puzzle text-3xl" />
          </button>

        </div>
      </div>
      {showPrompt && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-black border border-[#ff7700] rounded-3xl p-6 text-center shadow-[0_0_16px_#ff7700] w-[300px]">
            <div className="flex flex-col gap-4">
              <button
                className="px-4 py-2 border border-[#00e0ff] text-[#00e0ff] rounded-3xl hover:bg-[#00e0ff] hover:text-black transition shadow-md"
                onClick={() => {
                  setShowPrompt(false);
                  needLogin(() => {
                    setIsCreatingSet(true);
                    setIsEditingSet(null);
                    setIsCreatePuzzle(false);
                    setSelectedSet(null);
                    setIsHome(false);
                  });
                }}
              >
                <i className="bi bi-journal mr-2" />
                {t.createset}
              </button>
              <button
                className="px-4 py-2 border border-[#00e0ff] text-[#00e0ff] rounded-3xl hover:bg-[#00e0ff] hover:text-black transition shadow-md"
                onClick={() => {
                  setShowPrompt(false);
                  needLogin(() => {
                    setShowGenerator(true);
                    setIsCreatingSet(false);
                    setSelectedSet(null);
                    setIsHome(false);
                  });
                }}
              >
                <i className="bi bi-puzzle mr-2" />
                {t.createnewpuzzle}
              </button>
              <button
                onClick={() => setShowPrompt(false)}
                className="text-sm mt-2 text-[#ff7700] "
              >
                {t.backbtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}



