// Shift + Option + F to Format code
"use client";
import { useState, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"; // 🔹 Import motion at the top of your file
import 'bootstrap-icons/font/bootstrap-icons.css';
import MatchingCard from "./matchingcard";
import Findterm from "./findterm";
import CrosswordPuzzle from "./crossword";
import CrosswordPuzzlePage from "./crosswordpage";
import GeneratePuzzle from "./generatepuzzle";
import { useLanguage } from "./languagecontext";
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
import axios from 'axios';

export default function Home() {
  useEffect(() => {
    document.body.style.fontFamily = "Itim, sans-serif";
  }, []);
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const [isCreatingSet, setIsCreatingSet] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isWingPanelOpen, setIsWingPanelOpen] = useState(false);
  const [isEditingSet, setIsEditingSet] = useState(null);
  const [screenWidth, setScreenWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  const [isCreatePuzzle, setIsCreatePuzzle] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [isHome, setIsHome] = useState(false);
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
        .catch((err) => console.error('Failed to refresh study sets after login:', err));
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
        .catch((err) => console.error('Failed to refresh study sets after login:', err));

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
        const response = await getPublicPuzzleSets();  // Fetch public sets from the backend
        console.log("Public Puzzle Sets: ", response);
        setPublicPuzzleSets(response);
      } catch (err) {
        console.error("Failed to fetch public Puzzle sets:", err);
      }
    }
    fetchPublicPuzzleSets();
  }, []);


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

  function needLogin(action) {
    if (!username) {
      setShowNeedLogin(true);
      return false;
    }
    action();
    return true;
  }

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
          <header className="flex justify-between items-center p-4 bg-black text-white">

            {/* Left: Hamburger & App Name */}
            <div className="flex items-center">
              <button
                className="bg-black text-[#00e0ff] text-2xl focus:outline-none w-9 h-9 flex items-center justify-center rounded-full transition duration-300 hover:bg-[#00e0ff] hover:text-black"
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

              {/* Web Title (Changes based on screen size) */}
              <img
                src="/logo5.png"
                alt="Hippocampus Logo"
                className={`h-10 w-15 object-contain ml-1 ${screenWidth <= 770 ? "block" : "hidden"}`}
              />
              <div className="fle px-1">
                <img
                  src="/logo6.png"
                  alt="Hippocampus Logo"
                  className={`h-14 w-40 object-contain ml-2 ${screenWidth > 770 ? "block" : "hidden"}`}
                />
              </div>
            </div>


            {/* Middle: Search Bar */}
            {screenWidth >= 620 && (
              <div className="w-2/3 flex justify-center px-4">
                <div className="relative w-full max-w-lg">
                  {/* Neon Blue Search Icon */}
                  <i className="bi bi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-[#00e0ff]"></i>

                  {/* Neon Input Field */}
                  <input
                    type="text"
                    placeholder={t.searchbar}
                    className="bg-black  text-[#00e0ff] placeholder-[#00e0ff] px-10 py-2 rounded-lg w-full border border-[#00e0ff] focus:outline-none focus:ring-2 focus:ring-[#00e0ff] shadow-[0_0_8px_#00e0ff] transition"
                  />
                </div>
              </div>
            )}

            {/* Right: Plus Button, Type/Draw Toggle, User Info */}
            <div className="flex items-center gap-4">
              <div className="relative inline-block text-left" ref={dropdownRef}>
                <button
                  onClick={() => setShowSetOption((prev) => !prev)}
                  className="bg-black border-2 border-[#ff7700] text-[#ff7700] px-4 py-2 rounded-lg transition duration-300 hover:bg-[#ff7700] hover:text-black shadow-md hover:shadow-[0_0_12px_#ff7700]"
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
                      <div className="absolute right-0 mt-2 w-[150px] bg-black border border-[#00e0ff] rounded-lg shadow-[0_0_12px_#00e0ff] z-50">
                        <button
                          onClick={() => {
                            setIsAuth(false);
                            setUsername("");
                            setStudySets([]);
                            setShowDropdown(false); // 👈 CLOSE DROPDOWN ON LOGOUT TOO
                            localStorage.removeItem("token");
                            localStorage.removeItem("username");
                          }}
                          className="block w-full px-4 py-2 text-left text-[#00e0ff] hover:bg-[#00e0ff] hover:text-black transition"
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
                  <div className="min-w-[80px] max-w-[80px] px-2 py-1 bg-black border border-[#00e0ff] rounded-md flex items-center justify-center">
                    <span className="text-[#00e0ff] drop-shadow-[0_0_8px_#00e0ff] font-semibold text-sm whitespace-nowrap">
                      {lang === "vi" ? "Tiếng Việt" : "English"}
                    </span>
                  </div>
                </div>

                {showLangMenu && (
                  <div className="absolute right-0 mt-2 w-32 bg-black border border-[#00e0ff] rounded-lg shadow-[0_0_12px_#00e0ff] z-50">
                    <button
                      onClick={() => { setLang("en"); setShowLangMenu(false); }}
                      className="w-full px-4 py-2 text-left text-[#00e0ff] hover:bg-[#00e0ff] hover:text-black transition"
                    >
                      English
                    </button>
                    <button
                      onClick={() => { setLang("vi"); setShowLangMenu(false); }}
                      className="w-full px-4 py-2 text-left text-[#00e0ff] hover:bg-[#00e0ff] hover:text-black transition"
                    >
                      Tiếng Việt
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Search bar adjusts when screen width < 620px */}
          {screenWidth < 620 && (
            <div className="w-full px-4 mt-2 flex justify-center">
              <div className="relative w-full max-w-none">
                <i className="bi bi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-[#00e0ff]"></i>
                <input
                  type="text"
                  placeholder={t.searchbar}
                  className="bg-black text-[#00e0ff] placeholder-[#00e0ff] px-10 py-2 rounded-lg w-full border border-[#00e0ff] shadow-[0_0_12px_#00e0ff] focus:outline-none focus:ring-2 focus:ring-[#00e0ff]"
                />
              </div>
            </div>
          )}


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
              t={t}
            />
          )}


          {/* Main Container with Sidebar & Content */}
          <div className="flex flex-1 relative">

            {/* Side Navigation */}
            <aside
              className={`bg-black p-4 transition-all border-t border-r border-[#00e0ff] rounded-tr-xl ${screenWidth <= 770 ? "hidden" : isMenuCollapsed ? "w-16" : "w-48"
                }`}
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
                  }}
                  className="flex items-center gap-2 px-2 py-1 rounded-lg transition duration-300  text-[#00e0ff] border border-[#00e0ff] hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff]"
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
                  }}
                  className="flex items-center gap-2 px-2 py-1 rounded-lg transition duration-300  text-[#00e0ff] border border-[#00e0ff] hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff]"
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
                  }}
                  className="flex items-center gap-2 px-2 py-1 rounded-lg transition duration-300  text-[#00e0ff] border border-[#00e0ff] hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff]">
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
                  className="flex items-center gap-2 px-2 py-1 rounded-lg transition duration-300  text-[#00e0ff] border border-[#00e0ff] hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff]"
                >
                  <i className="bi bi-puzzle"></i> {!isMenuCollapsed && t.playcrossword}
                </button>
              </nav>
            </aside>


            {/* Main Content Area */}
            <main
              className="flex-1 p-6 overflow-x-hidden overflow-y-visible relative"
              style={{ maxWidth: "100%" }}
            >
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
                />

              )}
            </main>

            {/* Right Panel (Hidden on small screens OR when creating a set) */}
            {screenWidth > 770 && isHome && (
              <div className="hidden md:block">
                <aside className="w-55 bg-black p-4 absolute right-0 top-0 h-full border-t border-l border-[#00e0ff] shadow-[0_0_10px_#00e0ff] rounded-tl-2xl">
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
              </div>
            )}
          </div>
        </div>
      )}
      {showNeedLogin && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-black p-6 rounded-lg text-white border border-[#00e0ff] shadow-[0_0_16px_#00e0ff] w-[350px]">
            <h2 className="text-2xl font-bold mb-4 text-[#ff7700] drop-shadow-[0_0_8px_#ff7700] text-center">
              {t.needlogin}
            </h2>
            <p className="text-center text-[#00e0ff] mb-6">
              {t.needloginlog}
            </p>

            <div className="flex justify-center gap-4">
              <button
                className="px-6 py-2 rounded-lg border border-[#00e0ff] text-[#00e0ff] hover:bg-[#00e0ff] hover:text-black transition duration-300 shadow-md hover:shadow-[0_0_12px_#00e0ff]"
                onClick={() => {
                  setShowNeedLogin(false);
                }}
              >
                {t.cancelbtn}
              </button>
              <button
                className="px-6 py-2 rounded-lg border border-[#00e0ff] text-[#00e0ff] hover:bg-[#00e0ff] hover:text-black transition duration-300 shadow-md hover:shadow-[0_0_12px_#00e0ff]"
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
      )}
    </DndProvider>
  );
}






/* Component: Home Content */
function HomeContent({ starredTerms, toggleStar, setStudySets, needLogin, setPublicSets, username, studySets, screenWidth, isEditing, setIsEditing, setIsEditingSet, setIsCreatingSet, selectedSet, setSelectedSet, setIsHome, publicSets, t }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
  const [clickedHeartId, setClickedHeartId] = useState(null);

  // Toggle star for terms, syncing with flashcard & list

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
      />
    );
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4 text-[#00e0ff] drop-shadow-[0_0_8px_#00e0ff]">{t.recentfile}</h2>
      {studySets.length > 0 ? (
        <div className="flex flex-col gap-4"> {/* 🔥 Add this flex column with gap */}
          {studySets.map((studySet, index) => (
            <div
              key={index}
              onClick={() => {
                setSelectedSet(studySet);
                setIsHome(false);
              }}
              className="flex flex-col gap-1 w-3/4 max-w-[400px] px-4 py-2 rounded-lg transition duration-300 text-[#00e0ff] border border-[#00e0ff] shadow-[0_0_20px_#00e0ff] hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff] cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <i className="bi bi-folder2"></i> {studySet.title} ({studySet.terms.length}{studySet.terms.length === 1 ? " " + t.termsg : " " + t.termmul})
              </div>

              {/* 🔥 Glow white text + orange username */}
              <div className="text-sm pl-6">
                <span className="text-white  font-semibold">Created by:</span>{" "}
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
      {publicSets.length > 0 ? (
        <div className="flex flex-col gap-4">
          {publicSets.map((publicSet, index) => (
            <div
              key={index}
              onClick={() => {
                setSelectedSet(publicSet);
                setIsHome(false);
              }}
              className="relative flex flex-col gap-1 w-3/4 max-w-[400px] px-4 py-2 rounded-lg transition duration-300 text-[#00e0ff] border border-[#00e0ff] shadow-[0_0_20px_#00e0ff] hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff] cursor-pointer"
            >
              {/* ❤️ Heart Absolute */}
              <div
                className="absolute top-1/2 right-2 flex items-center gap-2 text-2xl cursor-pointer transition-all duration-300 transform -translate-y-1/2"
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
                  style={{
                    width: "40px",
                    height: "40px",
                  }}
                >
                  <i
                    className={`bi ${publicSet.likes && publicSet.likes.includes(username)
                      ? "bi-heart-fill text-red-500 drop-shadow-[0_0_8px_red]"
                      : "bi-heart text-[#ff7700]"
                      }`}
                    style={{
                      paddingTop: "3px",
                    }}
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


              {/* 📂 Folder Title */}
              <div className="flex items-center gap-2">
                <i className="bi bi-folder2"></i>
                {publicSet.title} ({publicSet.terms.length}{publicSet.terms.length === 1 ? " " + t.termsg : " " + t.termmul})
              </div>

              {/* 👤 Username */}
              <div className="text-sm pl-6">
                <span className="text-white font-semibold">Created by:</span>{" "}
                <span className="text-[#ff7700] drop-shadow-[0_0_8px_#ff7700] font-semibold">
                  {publicSet.username}
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




/* Component: Create a New Learning Set */
function CreateSet({ onSave, t }) {
  const [numCards, setNumCards] = useState(1);  // Default to 1 card
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [alwaysAddOne, setAlwaysAddOne] = useState(false); // Checkbox state
  const [showCardDropdown, setShowCardDropdown] = useState(false); // Toggle dropdown
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState(""); // user input
  const [aiNumTerms, setAiNumTerms] = useState(10);  // default 10 terms
  const [isGenerating, setIsGenerating] = useState(false);
  const [termLanguage, setTermLanguage] = useState("English");
  const [definitionLanguage, setDefinitionLanguage] = useState("English");

  const [terms, setTerms] = useState([
    { id: 1, term: "", definition: "" },
    { id: 2, term: "", definition: "" },
    { id: 3, term: "", definition: "" },
  ]);
  const [errorMessage, setErrorMessage] = useState(""); // New state for error message

  const moveCard = (dragIndex, hoverIndex) => {
    const updatedTerms = [...terms];
    const [removed] = updatedTerms.splice(dragIndex, 1);
    updatedTerms.splice(hoverIndex, 0, removed);
    setTerms(updatedTerms.map((t, i) => ({ ...t, id: i + 1 }))); // Renumber blocks
  };

  const addCard = (count = 1) => {
    if (alwaysAddOne) count = 1;
    const newCards = Array.from({ length: count }, (_, i) => ({
      id: terms.length + i + 1,
      term: "",
      definition: ""
    }));
    setTerms([...terms, ...newCards]);
  };

  const removeCard = (index) => {
    setTerms(terms.filter((_, i) => i !== index).map((t, i) => ({ ...t, id: i + 1 })));
  };

  const handleSave = async () => {
    const usedTerms = terms.filter((t) => t.term.trim() !== "");
    if (usedTerms.length === 0) {
      setErrorMessage(t.need1term);
      return;
    }
    setErrorMessage(""); // Clear error message if valid

    if (title.trim() !== "") {
      const newStudySet = {
        username: localStorage.getItem('username'),  // ✅ correct field name
        title,
        description,
        terms: usedTerms,
        isPrivate: "Private",
      };

      try {
        const savedSet = await createStudySet(newStudySet);
        onSave(savedSet);
      } catch (error) {
        console.error("Failed to save study set:", error);
      }
    }
  };

  return (
    <div className="w-full max-w-[750px] px-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-[#00e0ff] drop-shadow-[0_0_8px_#00e0ff]">
          {t.createnewset}
        </h1>
        <div className="p-[2px] rounded-full bg-gradient-to-r from-pink-500 via-yellow-500 to-blue-500 shadow-[0_0_16px_#ff00ff]">
          <button
            onClick={() => setShowAiModal(true)}
            className="w-full px-6 py-2 rounded-full font-bold bg-black text-yellow-500 transition duration-500
            hover:bg-gradient-to-r hover:from-pink-500 hover:via-yellow-500 hover:to-blue-500 hover:text-white hover:scale-110"
          >
            {t.askai} ✨
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder={t.entertitle}
        className="bg-black text-[#ff7700] placeholder-white px-4 py-2 rounded-lg w-full mb-4 border border-[#00e0ff] shadow-[0_0_12px_#00e0ff] focus:outline-none focus:ring-2 focus:ring-[#00e0ff]"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder={t.enterdescription}
        className="bg-black text-[#00e0ff] placeholder-white px-4 py-2 rounded-lg w-full mb-4 border border-[#00e0ff] shadow-[0_0_12px_#00e0ff] focus:outline-none focus:ring-2 focus:ring-[#00e0ff]"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {errorMessage && (
        <p className="text-[#ff7700] text-lg font-semibold text-center mb-4 animate-pulse-glow">
          {errorMessage}
        </p>
      )}

      {/* Neon Orange Create Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={handleSave}
          className="bg-black text-[#ff7700] border border-[#ff7700] px-6 py-2 rounded-lg transition duration-300 hover:bg-[#ff7700] hover:text-black hover:scale-105 shadow-[0_0_12px_#ff7700]"
        >
          {t.createbtn}
        </button>
      </div>

      {terms.map((item, index) => (
        <DraggableCard
          t={t}
          key={index}
          index={index}
          id={item.id}
          term={item.term}
          definition={item.definition}
          moveCard={moveCard}
          onDelete={() => removeCard(index)}
          onTermChange={(value) =>
            setTerms(terms.map((t, i) => (i === index ? { ...t, term: value } : t)))
          }
          onDefinitionChange={(value) =>
            setTerms(terms.map((t, i) => (i === index ? { ...t, definition: value } : t)))
          }
        />
      ))}

      <div className="flex flex-col items-center gap-2">
        <div className="relative w-full flex flex-col items-center">
          {/* Add More Card Button */}
          <button
            onClick={() => {
              if (alwaysAddOne) {
                addCard(1);
              } else {
                setShowCardDropdown(!showCardDropdown);
              }
            }}
            className="bg-black text-[#00e0ff] border border-[#00e0ff] px-6 py-2 rounded-lg w-full shadow-[0_0_12px_#00e0ff] hover:bg-[#00e0ff] hover:text-black transition duration-300 flex items-center justify-center relative"
          >
            <span className="font-semibold">{t.addcard}</span>
            {!alwaysAddOne && (
              <span className="absolute right-4 text-xl font-bold">▼</span>
            )}
          </button>

          {/* Dropdown Appears Inside Button */}
          {!alwaysAddOne && showCardDropdown && (
            <div className="absolute top-full mt-1 w-full bg-black text-[#00e0ff] border border-[#00e0ff] rounded-lg shadow-[0_0_12px_#00e0ff] z-10">
              {[1, 2, 3, 4, 5].map((num) => (
                <div
                  key={num}
                  className="px-4 py-2 hover:bg-[#00e0ff] hover:text-black cursor-pointer text-center transition duration-200"
                  onClick={() => {
                    setNumCards(num);
                    setShowCardDropdown(false);
                    addCard(num);
                  }}
                >
                  {num} {num === 1 ? t.card : t.cards}
                </div>
              ))}
            </div>
          )}

          {/* Checkbox for "Always add 1 card" */}
          <label className="flex items-center text-sm mt-2 cursor-pointer text-[#ff7700]">
            <input
              type="checkbox"
              checked={alwaysAddOne}
              onChange={() => setAlwaysAddOne(!alwaysAddOne)}
              className="mr-2 w-5 h-5 rounded border-2 border-[#ff7700] bg-black appearance-none checked:bg-[#ff7700] checked:shadow-[0_0_10px_#ff7700] focus:ring-0 focus:outline-none transition duration-300"
            />
            {t.alway1card}
          </label>

        </div>
      </div>
      {showAiModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          {/* Rainbow Border around the Modal */}
          <div className="relative p-[3px] rounded-lg bg-gradient-to-r from-pink-500 via-yellow-500 to-blue-500 shadow-[0_0_20px_#ff00ff] w-[450px]">
            <div className="bg-black p-6 rounded-lg text-white w-full h-full">

              {/* Close Button */}
              <button
                className="absolute top-2 right-2 text-[#ff7700] text-xl hover:scale-110 transition"
                onClick={() => setShowAiModal(false)}
              >
                ✖
              </button>

              {/* Title */}
              <h2 className="text-2xl font-bold mb-4 text-white drop-shadow-[0_0_8px_white]">{t.aicreate}</h2>

              {/* Topic Input */}
              <label className="block mb-2 text-[#00e0ff]">{t.topic}</label>
              <input
                type="text"
                placeholder={t.topiceg}
                className="bg-black text-[#ff7700] placeholder-white px-4 py-2 rounded-lg w-full mb-4 border border-[#00e0ff] shadow-[0_0_12px_#00e0ff] focus:outline-none focus:ring-2 focus:ring-[#00e0ff]"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col">
                  <label className="mb-2 text-[#00e0ff]">{t.termlanguage}</label>
                  <select
                    value={termLanguage}
                    onChange={(e) => setTermLanguage(e.target.value)}
                    className="bg-black text-[#ff7700] px-4 py-2 rounded-lg border border-[#00e0ff] shadow-[0_0_8px_#00e0ff] focus:outline-none focus:ring-2 focus:ring-[#00e0ff] hover:bg-[#00e0ff] hover:text-black transition duration-300 text-center w-full"
                  >
                    <option value="English" className="bg-black text-[#00e0ff]">English</option>
                    <option value="Vietnamese" className="bg-black text-[#00e0ff]">Tiếng Việt</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="mb-2 text-[#00e0ff]">{t.deflanguage}</label>
                  <select
                    value={definitionLanguage}
                    onChange={(e) => setDefinitionLanguage(e.target.value)}
                    className="bg-black text-[#ff7700] px-4 py-2 rounded-lg border border-[#00e0ff] shadow-[0_0_8px_#00e0ff] focus:outline-none focus:ring-2 focus:ring-[#00e0ff] hover:bg-[#00e0ff] hover:text-black transition duration-300 text-center w-full"
                  >
                    <option value="English" className="bg-black text-[#00e0ff]">English</option>
                    <option value="Vietnamese" className="bg-black text-[#00e0ff]">Tiếng Việt</option>
                  </select>
                </div>
              </div>
              {/* Generate Button */}
              <div className="flex flex-col gap-4 items-center mt-2">
                <div className="flex flex-col">
                  <label className="mb-2 text-[#00e0ff]">{t.numterm}</label>
                  <select
                    value={aiNumTerms}
                    onChange={(e) => setAiNumTerms(e.target.value)}
                    className="bg-black text-[#ff7700] px-4 py-2 rounded-lg border border-[#00e0ff] 
                                           shadow-[0_0_8px_#00e0ff] focus:outline-none focus:ring-2 focus:ring-[#00e0ff] 
                                           hover:bg-[#00e0ff] hover:text-black transition duration-300 text-center w-full"
                  >
                    {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num} className="bg-black text-[#00e0ff]">
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="p-[2px] rounded-full bg-gradient-to-r from-pink-500 via-yellow-500 to-blue-500 shadow-[0_0_16px_#ff00ff] w-full max-w-[200px]">
                  <button
                    onClick={async () => {
                      setIsGenerating(true);
                      try {
                        const response = await fetch('http://localhost:5001/api/ai', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            topic: aiPrompt,
                            numTerms: aiNumTerms,
                            termLanguage,
                            definitionLanguage,
                          }),
                        });

                        const data = await response.json();

                        if (response.ok) {
                          console.log("Generated terms:", data.terms || data.studySet);
                          setTerms((data.terms || data.studySet).map((item, index) => ({
                            id: index + 1,
                            term: item.term,
                            definition: item.definition,
                          })));
                          setTitle(aiPrompt);
                          setShowAiModal(false);
                        } else {
                          console.error("Error generating set:", data.error);
                        }
                      } catch (err) {
                        console.error("Failed to call AI API:", err);
                      } finally {
                        setIsGenerating(false);
                      }
                    }}
                    disabled={isGenerating}
                    className={`w-full px-6 py-2 rounded-full font-bold bg-black text-yellow-500 transition duration-500
                                          ${isGenerating ? "" : "hover:bg-gradient-to-r hover:from-pink-500 hover:via-yellow-500 hover:to-blue-500 hover:text-white hover:scale-110"}`}
                  >
                    {isGenerating ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-[#ff7700]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"></path>
                        </svg>
                        <span>{t.genwait}</span>
                      </div>
                    ) : (
                      t.generatebtn
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




function EditSet({ studySet, setStudySets, setSelectedSet, onSave, onCancel, t }) {
  const [title, setTitle] = useState(studySet.title);
  const [description, setDescription] = useState(studySet.description);
  const [terms, setTerms] = useState(() =>
    studySet.terms.map((term, i) => ({
      ...term,
      id: i + 1, // 💡 add id here
    }))
  );

  const [errorMessage, setErrorMessage] = useState("");
  const [alwaysAddOne, setAlwaysAddOne] = useState(false); // Checkbox state
  const [showCardDropdown, setShowCardDropdown] = useState(false); // Toggle dropdown
  const [numCards, setNumCards] = useState(1);  // Default to 1 card

  const moveCard = (dragIndex, hoverIndex) => {
    const updatedTerms = [...terms];
    const [removed] = updatedTerms.splice(dragIndex, 1);
    updatedTerms.splice(hoverIndex, 0, removed);
    setTerms(updatedTerms.map((t, i) => ({ ...t, id: i + 1 }))); // Renumber blocks
  };

  const addCard = (count = 1) => {
    if (alwaysAddOne) count = 1;
    const newCards = Array.from({ length: count }, (_, i) => ({
      id: terms.length + i + 1,
      term: "",
      definition: ""
    }));
    setTerms([...terms, ...newCards]);
  };

  const removeCard = (index) => {
    setTerms(terms.filter((_, i) => i !== index).map((t, i) => ({ ...t, id: i + 1 })));
  };

  const handleSave = async () => {
    const usedTerms = terms.filter((t) => t.term.trim() !== "").map((t, i) => ({
      ...(t._id ? { _id: t._id } : {}), // Keep _id if it exists
      term: t.term,
      definition: t.definition,
    }));

    if (usedTerms.length === 0) {
      setErrorMessage(t.need1term); // You already handle this with errorMessage state
      return;
    }
    setErrorMessage(""); // Clear error message if valid

    const updatedSet = {
      username: studySet.username,
      title,
      description,
      terms: usedTerms,
      isPrivate: studySet.isPrivate,
    };

    try {
      const savedSet = await updateStudySet(studySet._id, updatedSet); // Use the ID for updating
      const username = localStorage.getItem("username");
      const sets = await getStudySets(username); // Reload updated sets
      setStudySets(sets); // Update state with fresh data

      onSave(savedSet); // Call the onSave prop to update the parent component
      setSelectedSet(null); // 🔥 clear selected set so it reloads
    } catch (error) {
      console.error("Failed to update study set:", error);
    }
  };

  return (
    <div className="w-full max-w-[750px] px-4">
      <h1 className="text-2xl font-bold mb-4 text-[#ff7700] drop-shadow-[0_0_8px_#ff7700]">{t.editset}</h1>

      <input
        type="text"
        placeholder={t.entertitle}
        className="bg-black text-[#ff7700] placeholder-[#ff7700] px-4 py-2 rounded-lg w-full mb-4 border border-[#00e0ff] shadow-[0_0_12px_#00e0ff] focus:outline-none focus:ring-2 focus:ring-[#00e0ff]"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder={t.enterdescription}
        className="bg-black text-white placeholder-white px-4 py-2 rounded-lg w-full mb-4 border border-[#00e0ff] shadow-[0_0_12px_#00e0ff] focus:outline-none focus:ring-2 focus:ring-[#00e0ff]"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {errorMessage && (
        <p className="text-red drop-shadow-[0_0_8px_red] text-lg font-semibold text-center mb-4 animate-pulse-glow">
          {errorMessage}
        </p>
      )}

      {/* Done Button */}
      <div className="flex justify-center mb-5 ">
        <button
          onClick={handleSave}
          className="bg-black text-[#ff7700] border border-[#ff7700] px-6 py-2 rounded-lg transition duration-300 hover:bg-[#ff7700] hover:text-black hover:scale-105 shadow-[0_0_12px_#ff7700]"
        >
          {t.donebt}
        </button>
      </div>

      {terms.map((item, index) => (
        <DraggableCard
          t={t}
          key={index}
          index={index}
          id={item.id}
          term={item.term}
          definition={item.definition}
          moveCard={moveCard}
          onDelete={() => removeCard(index)}
          onTermChange={(value) =>
            setTerms(terms.map((t, i) => (i === index ? { ...t, term: value } : t)))
          }
          onDefinitionChange={(value) =>
            setTerms(terms.map((t, i) => (i === index ? { ...t, definition: value } : t)))
          }
        />
      ))}

      <div className="flex flex-col items-center gap-2">
        <div className="relative w-full flex flex-col items-center">
          {/* Add More Card Button */}
          <button
            onClick={() => {
              if (alwaysAddOne) {
                addCard(1);
              } else {
                setShowCardDropdown(!showCardDropdown);
              }
            }}
            className="bg-black text-[#00e0ff] border border-[#00e0ff] px-6 py-2 rounded-lg w-full shadow-[0_0_12px_#00e0ff] hover:bg-[#00e0ff] hover:text-black transition duration-300 flex items-center justify-center relative"
          >
            <span className="font-semibold">{t.addcard}</span>
            {!alwaysAddOne && (
              <span className="absolute right-4 text-xl font-bold">▼</span>
            )}
          </button>

          {/* Dropdown Appears Inside Button */}
          {!alwaysAddOne && showCardDropdown && (
            <div className="absolute top-full mt-1 w-full bg-black text-[#00e0ff] border border-[#00e0ff] rounded-lg shadow-[0_0_12px_#00e0ff] z-10">
              {[1, 2, 3, 4, 5].map((num) => (
                <div
                  key={num}
                  className="px-4 py-2 hover:bg-[#00e0ff] hover:text-black cursor-pointer text-center transition duration-200"
                  onClick={() => {
                    setNumCards(num);
                    setShowCardDropdown(false);
                    addCard(num);
                  }}
                >
                  {num} {num === 1 ? t.card : t.cards}
                </div>
              ))}
            </div>
          )}

          {/* Checkbox for "Always add 1 card" */}
          <label className="flex items-center text-sm mt-2 cursor-pointer text-[#ff7700]">
            <input
              type="checkbox"
              checked={alwaysAddOne}
              onChange={() => setAlwaysAddOne(!alwaysAddOne)}
              className="mr-2 w-5 h-5 rounded border-2 border-[#ff7700] bg-black appearance-none checked:bg-[#ff7700] checked:shadow-[0_0_10px_#ff7700] focus:ring-0 focus:outline-none transition duration-300"
            />
            {t.alway1card}
          </label>

        </div>
      </div>
    </div>
  );
}







/* Draggable Card Component */
function DraggableCard({ id, index, term, definition, moveCard, onDelete, onTermChange, onDefinitionChange, t }) {
  const [{ isDragging }, ref] = useDrag({
    type: "CARD",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "CARD",
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveCard(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });
  const termRef = useRef(null);
  const defRef = useRef(null);

  // Auto-expand term field
  useEffect(() => {
    if (termRef.current) {
      termRef.current.style.height = "auto";
      termRef.current.style.height = termRef.current.scrollHeight + "px";
    }
  }, [term]);

  // Auto-expand definition field
  useEffect(() => {
    if (defRef.current) {
      defRef.current.style.height = "auto";
      defRef.current.style.height = defRef.current.scrollHeight + "px";
    }
  }, [definition]);

  return (
    <div ref={(node) => ref(drop(node))} className={`bg-[#1a2e30] p-6 rounded-lg mb-4 border-2 border-[#00e0ff] shadow-[0_0_12px_#00e0ff] ${isDragging ? "opacity-50" : ""}`}>
      <div className="flex justify-between border-b border-[#00e0ff] pb-2 mb-2">
        {/* 🔸 Box Number in Neon Orange */}
        <span className="text-lg font-bold text-white drop-shadow-[0_0_8px_white]">{id}</span>
        <div>
          <span className="cursor-move mr-4 text-white drop-shadow-[0_0_8px_white] transition duration-300 hover:scale-110">═</span>
          <button
            onClick={onDelete}
            className="text-white drop-shadow-[0_0_8px_white] transition duration-300 hover:scale-110"
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* 🔸 Term input (now textarea) */}
        <textarea
          ref={termRef}
          placeholder={t.enterterm}
          className="w-2/6 px-4 py-2 rounded-lg text-[#ff7700] bg-black border border-white placeholder-white shadow-[0_0_8px_white] focus:outline-none min-h-[40px] overflow-hidden resize-none"
          value={term}
          onChange={(e) => onTermChange(e.target.value)}
        />

        <span className="text-[#00e0ff] text-5xl px-1 font-light">|</span>

        {/* 🔸 Definition input (now textarea) */}
        <textarea
          ref={defRef}
          placeholder={t.enterdefinition}
          className="w-4/6 px-4 py-2 rounded-lg text-[#ff7700] bg-black border border-white placeholder-white shadow-[0_0_8px_white] focus:outline-none min-h-[40px] overflow-hidden resize-none"
          value={definition}
          onChange={(e) => onDefinitionChange(e.target.value)}
        />


        <button
          className="bg-black text-white border border-white px-4 py-2 rounded-lg hover:shadow-[0_0_10px_white] transition duration-300 ml-2"
        >
          <i className="bi bi-image"></i> {t.addimage}
        </button>
      </div>

    </div>


  );
}





function LibraryContent({ starredTerms, toggleStar, puzzleSets, setPuzzleSets, studySets, screenWidth, isEditing, setIsEditing, setIsEditingSet, setIsCreatingSet, selectedSet, setSelectedSet, setIsHome, setStudySets, t }) {
  const [isManaging, setIsManaging] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  const togglePrivatePublic = async (index) => {
    try {
      const updatedSets = [...studySets];

      // Switch between "Private" and "Public"
      updatedSets[index].isPrivate = updatedSets[index].isPrivate === "Private" ? "Public" : "Private";
      setStudySets(updatedSets); // 🔥 Instant frontend update
      const studySet = updatedSets[index];
      const payload = {
        isPrivate: studySet.isPrivate,
      };
      const response = await updateStudySet(studySet._id, payload);

    } catch (error) {
      console.error("❌ Failed to update isPrivate:", error);
    }
  };

  const handleDeleteStudySet = async (index) => {
    const studySetId = studySets[index]._id;  // You have _id in each studySet
    try {
      await deleteStudySet(studySetId);
      // After successful delete, update local studySets
      const updatedSets = [...studySets];
      updatedSets.splice(index, 1);
      setStudySets(updatedSets);
    } catch (error) {
      console.error('Failed to delete study set:', error);
    }
  };

  // --- Functions for PuzzleSets ---
  const handleDeletePuzzleSet = async (index) => {
    const puzzleSetId = puzzleSets[index]._id;
    try {
      await deletePuzzleSet(puzzleSetId);
      const updatedSets = [...puzzleSets];
      updatedSets.splice(index, 1);
      setPuzzleSets(updatedSets);
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
      const payload = {
        isPrivate: puzzleSet.isPrivate,
      };
      const response = await updatePuzzleSet(puzzleSet._id, payload);
    } catch (error) {
      console.error("Failed to update puzzle set privacy:", error);
    }
  };

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
          className="px-4 py-2 border-2 border-[#ff7700] text-[#ff7700] rounded-lg hover:bg-[#ff7700] hover:text-black shadow-[0_0_8px_#ff7700] hover:shadow-[0_0_12px#ff7700] transition duration-300 font-bold"
        >
          {isManaging ? t.doneManaging : t.manageLibrary}
        </button>

      </div>
      {studySets.length > 0 ? (
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
              className="relative flex items-center gap-2 w-3/4 max-w-[400px] px-4 py-2 rounded-lg transition duration-300 text-[#00e0ff] border border-[#00e0ff] shadow-[0_0_20px_#00e0ff] hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff] cursor-pointer"
            >
              {/* ❤️ Heart inside Folder */}
              <div
                className="absolute top-1/2 right-2 flex items-center gap-1 text-xl transform -translate-y-1/2"
              >
                <i
                  className={`bi ${studySet.likes && studySet.likes.length > 0
                    ? "bi-heart-fill text-[#00e0ff] drop-shadow-[0_0_6px_#00e0ff]"
                    : "bi-heart text-[#00e0ff] drop-shadow-[0_0_6px_#00e0ff]"
                    }`}
                  style={{ paddingTop: "2px" }}
                ></i>
                <span className="text-xs text-[#00e0ff] drop-shadow-[0_0_6px_#00e0ff]">
                  {studySet.likes ? studySet.likes.length : 0}
                </span>
              </div>
              {/* 📂 Title and Terms */}
              <i className="bi bi-folder2"></i> {studySet.title} ({studySet.terms.length}{studySet.terms.length === 1 ? " " + t.termsg : " " + t.termmul})
            </div>


            {/* Manage Buttons */}
            {isManaging && (
              <div className="flex gap-2">
                {/* Trash Box */}
                <button
                  onClick={() => handleDeleteStudySet(index)}
                  className="flex items-center justify-center w-10 h-10 rounded-lg border border-red-500 text-red-500 drop-shadow-[0_0_8px_red] transition duration-300 hover:scale-110"
                >
                  <i className="bi bi-trash"></i>
                </button>

                {/* Lock/Unlock Box */}
                {studySet.isPrivate === "Copy" ? (
                  <div
                    className="flex items-center justify-center w-20 h-10 rounded-lg border-2 border-[#00e0ff] text-[#00e0ff] drop-shadow-[0_0_8px_#00e0ff] font-bold cursor-default"
                  >
                    Copied
                  </div>
                ) : (
                  <button
                    onClick={() => togglePrivatePublic(index)}
                    className={`flex items-center justify-center w-20 h-10 rounded-lg border transition duration-300 hover:scale-110 font-bold
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
      {puzzleSets.length > 0 ? (
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
              className="relative flex items-center gap-2 w-3/4 max-w-[400px] px-4 py-2 rounded-lg transition duration-300 text-[#00e0ff] border border-[#00e0ff] shadow-[0_0_20px_#00e0ff] hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff] cursor-pointer"
            >
              {/* ❤️ Heart inside Folder */}
              <div
                className="absolute top-1/2 right-2 flex items-center gap-1 text-xl transform -translate-y-1/2"
              >
                <i
                  className={`bi ${puzzleSet.likes && puzzleSet.likes.length > 0
                    ? "bi-heart-fill text-[#00e0ff] drop-shadow-[0_0_6px_#00e0ff]"
                    : "bi-heart text-[#00e0ff] drop-shadow-[0_0_6px_#00e0ff]"
                    }`}
                  style={{ paddingTop: "2px" }}
                ></i>
                <span className="text-xs text-[#00e0ff] drop-shadow-[0_0_6px_#00e0ff]">
                  {puzzleSet.likes ? puzzleSet.likes.length : 0}
                </span>
              </div>
              <i className="bi bi-folder2"></i> {puzzleSet.title} ({puzzleSet.terms.length} {puzzleSet.terms.length === 1 ? t.termsg : t.termmul})
            </div>

            {isManaging && (
              <div className="flex gap-2">
                {/* Delete Puzzle */}
                <button
                  onClick={() => handleDeletePuzzleSet(index)}
                  className="flex items-center justify-center w-10 h-10 rounded-lg border border-red-500 text-red-500 drop-shadow-[0_0_8px_red] transition duration-300 hover:scale-110"
                >
                  <i className="bi bi-trash"></i>
                </button>

                {/* Toggle Puzzle Privacy */}
                {/* Lock/Unlock Box */}
                {puzzleSet.isPrivate === "Copy" ? (
                  <div
                    className="flex items-center justify-center w-20 h-10 rounded-lg border-2 border-[#00e0ff] text-[#00e0ff] drop-shadow-[0_0_8px_#00e0ff] font-bold cursor-default"
                  >
                    Copied
                  </div>
                ) : (
                  <button
                    onClick={() => togglePrivatePublic(index)}
                    className={`flex items-center justify-center w-20 h-10 rounded-lg border transition duration-300 hover:scale-110 font-bold
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





function WingPanel({ isOpen, setIsOpen, setIsCreatePuzzle, setSelectedSet, setIsCreatingSet, setIsHome, setIsEditingSet, t }) {
  return (
    <motion.aside
      className="fixed top-0 left-0 h-full w-48 bg-black p-4 z-50 border-t border-r border-[#00e0ff] rounded-tr-xl"
      initial={{ x: -200 }}
      animate={{ x: isOpen ? 0 : -200 }}
      transition={{ duration: 0.3 }}
    >

      {/* BigMac Button & Web Title "W" */}
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
          className={`h-10 w-15 object-contain ml-1`}
        />
      </div>

      {/* Navigation Items */}
      <nav className="flex flex-col gap-4 mt-6">
        <button
          onClick={() => {
            setIsCreatingSet(false);
            setIsHome(true);
            setIsCreatePuzzle(false);
            setIsEditingSet(null);
            setSelectedSet(null);
            setIsOpen(false);
          }}
          className="flex items-center gap-2 px-2 py-1 rounded-lg transition duration-300 text-[#00e0ff] border border-[#00e0ff] hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff]"
        >
          <i className="bi bi-house-door"></i> {t.home}
        </button>

        <button
          onClick={() => {
            setSelectedSet(null);
            setIsCreatingSet("library");
            setIsCreatePuzzle(false);
            setIsHome(false);
            setIsOpen(false);
          }}
          className="flex items-center gap-2 px-2 py-1 rounded-lg transition duration-300 text-[#00e0ff] border border-[#00e0ff] hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff]"
        >
          <i className="bi bi-folder2"></i> {t.library}
        </button>

        <hr className="border-[#00e0ff]" />
        <p className="text-sm text-[#00e0ff] drop-shadow-[0_0_8px_#00e0ff]">{t.yourFolders}</p>

        <button
          onClick={() => {
            setIsOpen(false);
          }}
          className="flex items-center gap-2 px-2 py-1 rounded-lg transition duration-300 text-[#00e0ff] border border-[#00e0ff] hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff]"
        >
          <i className="bi bi-plus"></i> {t.createfolder}
        </button>

        <hr className="border-[#00e0ff]" />
        <p className="text-sm text-[#00e0ff] drop-shadow-[0_0_8px_#00e0ff]">{t.explore}</p>

        <button
          onClick={() => {
            setIsCreatePuzzle(true);
            setIsCreatingSet(false);
            setSelectedSet(null);
            setIsOpen(false);
          }}
          className="flex items-center gap-2 px-2 py-1 rounded-lg transition duration-300 text-[#00e0ff] border border-[#00e0ff] hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff]"
        >
          <i className="bi bi-puzzle"></i> {t.playcrossword}
        </button>
      </nav>
    </motion.aside>
  );
}


function PuzzlePage({ needLogin, screenWidth, setIsHome, setShowGenerator, showGenerator, setSelectedPuzzle, puzzleSets, setPuzzleSets, publicPuzzleSets, setPublicPuzzleSets, username, t }) {
  const [showCrosswordPuzzle, setShowCrosswordPuzzle] = useState(false);
  const [selectedSet, setSelectedSet] = useState(null);
  const [clickedHeartId, setClickedHeartId] = useState(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

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
          className="px-4 py-2 rounded-lg border border-[#ff7700] text-[#ff7700] hover:bg-[#ff7700] hover:text-black transition duration-300 shadow-md hover:shadow-[0_0_12px_#ff7700]"
        >
          {t.createyourpuzzle}
        </button>

      </div>

      {/* Your Created Puzzle Sets */}
      {puzzleSets.length > 0 ? (
        <div className="flex flex-col gap-4">
          {puzzleSets.map((puzzleSet, index) => (
            <div
              key={index}
              onClick={() => {
                setSelectedSet(puzzleSet);
                setShowCrosswordPuzzle(true);
                setIsHome(false);
              }}
              className="flex flex-col gap-1 w-3/4 max-w-[400px] px-4 py-2 rounded-lg transition duration-300 text-[#00e0ff] border border-[#00e0ff] shadow-[0_0_20px_#00e0ff] hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff] cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <i className="bi bi-folder2"></i> {puzzleSet.title} ({puzzleSet.terms.length}{puzzleSet.terms.length === 1 ? " " + t.termsg : " " + t.termmul})
              </div>

              {/* 🔥 Glow white text + orange username */}
              <div className="text-sm pl-6">
                <span className="text-white  font-semibold">Created by:</span>{" "}
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
      <h2 className="text-lg font-semibold mt-10 mb-4 text-[#00e0ff] drop-shadow-[0_0_8px_#00e0ff]">{t.otherpuzzle}</h2>

      {publicPuzzleSets.length > 0 ? (
        <div className="flex flex-col gap-4">
          {publicPuzzleSets.map((publicPuzzleSet, index) => (
            <div
              key={index}
              onClick={() => {
                setSelectedSet(publicPuzzleSet);
                setIsHome(false);
              }}
              className="relative flex flex-col gap-1 w-3/4 max-w-[400px] px-4 py-2 rounded-lg transition duration-300 text-[#00e0ff] border border-[#00e0ff] shadow-[0_0_20px_#00e0ff] hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff] cursor-pointer"
            >
              {/* ❤️ Heart Absolute */}
              <div
                className="absolute top-1/2 right-2 flex items-center gap-2 text-2xl cursor-pointer transition-all duration-300 transform -translate-y-1/2"
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
                    ? "border-red-500"
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
                      ? "bi-heart-fill text-red-500 drop-shadow-[0_0_8px_red]"
                      : "bi-heart text-[#ff7700]"
                      }`}
                    style={{
                      paddingTop: "3px",
                    }}
                  ></i>
                </div>
                <span
                  className={`text-sm ${publicPuzzleSet.likes && publicPuzzleSet.likes.includes(username)
                    ? "text-red-500"
                    : "text-[#ff7700]"
                    }`}
                >
                  {publicPuzzleSet.likes ? publicPuzzleSet.likes.length : 0}
                </span>
              </div>


              {/* 📂 Folder Title */}
              <div className="flex items-center gap-2">
                <i className="bi bi-folder2"></i>
                {publicPuzzleSet.title} ({publicPuzzleSet.terms.length}{publicPuzzleSet.terms.length === 1 ? " " + t.termsg : " " + t.termmul})
              </div>

              {/* 👤 Username */}
              <div className="text-sm pl-6">
                <span className="text-white font-semibold">Created by:</span>{" "}
                <span className="text-[#ff7700] drop-shadow-[0_0_8px_#ff7700] font-semibold">
                  {publicPuzzleSet.username}
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







function FlashcardReview({ setStudySets, studySets, studySet, onExit, screenWidth, starredTerms, toggleStar, isEditing, setIsEditing, setIsEditingSet, setIsCreatingSet, setSelectedSet, t }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [editTerm, setEditTerm] = useState("");
  const [editDefinition, setEditDefinition] = useState("");
  const [editingIndex, setEditingIndex] = useState(null); // Track the item being edited
  const [showMatchingTest, setShowMatchingTest] = useState(false);
  const [showFillTest, setShowFillTest] = useState(false);
  const [showCrosswordPuzzle, setShowCrosswordPuzzle] = useState(false);
  const scrollPauseTimerRef = useRef(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const isOwner = studySet.username === localStorage.getItem("username");
  const resetScrollPauseTimer = () => {
    if (scrollPauseTimerRef.current) clearTimeout(scrollPauseTimerRef.current);
    scrollPauseTimerRef.current = setTimeout(() => {
      setFlipped(false); // stay flipped front
      // Add any visual reset if needed
    }, 500);
  };

  // Get the current term
  const currentTerm = studySet.terms[currentIndex].term;

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % studySet.terms.length);
    setFlipped(false);
  };

  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + studySet.terms.length) % studySet.terms.length);
    setFlipped(false);
  };

  // Open the edit modal
  const handleEditClick = (termObj, index) => {
    setEditTerm(termObj.term);  // Pre-fill term
    setEditDefinition(termObj.definition);  // Pre-fill definition
    setEditingIndex(index); // Store the index of the editing item
    setIsEditing(true);  // Show the modal
  };

  // Save changes
  const handleSaveEdit = async () => {
    if (editingIndex !== null) {
      const updatedTerms = [...studySet.terms];
      updatedTerms[editingIndex] = { term: editTerm, definition: editDefinition };
      studySet.terms = updatedTerms; // Update locally too

      try {
        const updatedSet = {
          ...studySet,
          terms: updatedTerms,
        };
        await updateStudySet(studySet._id, updatedSet);  // 🔥 Send to backend
        console.log("✅ Term saved to MongoDB!");
      } catch (error) {
        console.error("❌ Failed to save term edit:", error);
      }
    }
    setIsEditing(false); // Close the modal
  };

  const handleCopySet = async () => {
    try {
      const username = localStorage.getItem("username");
      if (!username) {
        setShowNeedLogin(true);
        return;
      }

      const copiedSet = {
        username,
        title: studySet.title + " (Copy)",
        description: studySet.description,
        terms: studySet.terms.map(term => ({
          term: term.term,
          definition: term.definition
        })),
        isPrivate: "Copy"
      };

      const response = await createStudySet(copiedSet);
      console.log("✅ Copied set:", response);

      // 🛠️ After copying, refresh your library
      const updatedSets = await getStudySets(username);
      setStudySets(updatedSets); // 🔥 update instantly!

      setCopySuccess(true); // show popup
    } catch (error) {
      console.error("❌ Failed to copy set:", error);
      setCopyError(true);
    }
  };

  return (
    <div className="flex flex-1">
      {/* Main Flashcard Area */}
      <div className="flex-1 overflow-hidden" style={{ maxWidth: "100%", overflowX: "hidden" }}>
        {copySuccess && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
            <div className="bg-black p-6 rounded-lg text-white border border-[#00e0ff] shadow-[0_0_16px_#00e0ff] w-[350px]">
              <h2 className="text-2xl font-bold mb-4 text-[#00e0ff] text-center drop-shadow-[0_0_8px_#00e0ff]">Set Copied!</h2>
              <p className="text-center text-[#00e0ff] mb-6">
                Your copy has been created. Go to your Library to review it!
              </p>
              <div className="flex justify-center">
                <button
                  className="px-6 py-2 rounded-lg border border-[#00e0ff] text-[#00e0ff] hover:bg-[#00e0ff] hover:text-black transition duration-300 shadow-md hover:shadow-[0_0_12px_#00e0ff]"
                  onClick={() => {
                    setCopySuccess(false);
                    onExit(); // Go back to library view
                  }}
                >
                  Go to Library
                </button>
              </div>
            </div>
          </div>
        )}

        {copyError && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
            <div className="bg-black p-6 rounded-lg text-white border border-[#ff0000] shadow-[0_0_16px_red] w-[350px]">
              <h2 className="text-2xl font-bold mb-4 text-[#ff0000] text-center drop-shadow-[0_0_8px_red]">Copy Failed!</h2>
              <p className="text-center text-[#ff0000] mb-6">
                Something went wrong. Please try again later.
              </p>
              <div className="flex justify-center">
                <button
                  className="px-6 py-2 rounded-lg border border-[#ff0000] text-[#ff0000] hover:bg-[#ff0000] hover:text-black transition duration-300 shadow-md hover:shadow-[0_0_12px_red]"
                  onClick={() => setCopyError(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={`flex items-center justify-between mb-6 ${screenWidth > 770 ? "w-[60%]" : "w-full"}`}>
          <h2 className="text-3xl font-semibold text-left text-[#ff7700] drop-shadow-[0_0_8px_#ff7700]">
            {studySet.title}
          </h2>
          {studySet.username !== localStorage.getItem("username") && (
            <button
              onClick={handleCopySet}
              className="flex items-center gap-2 px-4 py-2 bg-black text-[#00e0ff] border-2 border-[#00e0ff] rounded-lg hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff] transition duration-300 text-sm ml-4"
            >
              <i className="bi bi-files"></i>
              Copy
            </button>

          )}
        </div>

        {showMatchingTest ? (
          <MatchingCard
            t={t}
            setShowMatchingTest={setShowMatchingTest}
            screenWidth={screenWidth}
            setSelectedSet={setSelectedSet}
            studySet={studySet} // ✅ Corrected to `studySet`
          />
        ) : showFillTest ? (
          <Findterm
            t={t}
            screenWidth={screenWidth}
            setSelectedSet={setSelectedSet}
            studySet={studySet} // ✅ Corrected to `studySet`
            setShowFillTest={setShowFillTest}
          />
        ) : showCrosswordPuzzle ? (
          <CrosswordPuzzle
            t={t}
            screenWidth={screenWidth}
            setSelectedSet={setSelectedSet}
            studySet={studySet} // ✅ Corrected to `studySet`
            // setShowCrosswordPuzzle={setShowCrosswordPuzzle}
            onBack={() => setShowCrosswordPuzzle(false)}
          />
        ) : (
          <div className={`flex flex-col ${screenWidth > 770 ? "items-start" : "items-center"} w-full`}>

            {/* Mode Selection Buttons - Now Inside the Flashcard Layout */}
            <div className={`flex gap-4 mb-4 ${screenWidth > 770 ? "w-[60%]" : "w-full"} `}>
              <button
                onClick={() => setShowMatchingTest(true)}
                className="flex-1 px-4 py-2 bg-[#1a2e30] text-[#00e0ff] border-2 border-[#00e0ff] shadow-[0_0_20px_#00e0ff] rounded-lg transition duration-300 hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff]"
              >
                {t.matchingcard}
              </button>
              <button
                onClick={() => setShowFillTest(true)}
                className="flex-1 px-4 py-2 bg-[#1a2e30] text-[#00e0ff] border border-2 border-[#00e0ff] shadow-[0_0_20px_#00e0ff] rounded-lg transition duration-300 hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff]"
              >
                {t.fillIn}
              </button>
              <button
                onClick={() => setShowCrosswordPuzzle(true)}
                className="flex-1 px-4 py-2 bg-[#1a2e30] text-[#00e0ff] border border-2 border-[#00e0ff] shadow-[0_0_20px_#00e0ff] rounded-lg transition duration-300 hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff]"
              >
                {t.puzzle}
              </button>
            </div>


            {/* Loop Test Button - Also Inside for Consistent Alignment */}
            <div className={`mb-4 ${screenWidth > 770 ? "w-[60%]" : "w-full"}`}>
              <button className="w-full px-4 py-2 bg-[#1a2e30] text-[#00e0ff] border border-2 border-[#00e0ff] shadow-[0_0_20px_#00e0ff] rounded-lg hover:bg-[#00e0ff] hover:text-black shadow-md hover:shadow-[0_0_12px_#00e0ff] flex items-center justify-center gap-2 transition duration-300">
                <i className="bi bi-arrow-repeat"></i> {t.loopTest}
              </button>
            </div>


            {/* Flashcard scroll Animation */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div

                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.1 }}
                className={`relative ${screenWidth <= 770 ? "w-full" : "w-full ml-0"}`}
              >
                {/* Flashcard with Flip Animation */}
                <motion.div
                  className={`h-[35vh] flex items-center justify-center p-6 rounded-lg text-center text-3xl cursor-pointer select-none relative transition-all duration-300
                    ${starredTerms[studySet.terms[currentIndex].term]
                      ? "bg-[#45311f] border-2 border-[#ff7700] shadow-[0_0_20px_#ff7700]"
                      : "bg-[#474747] border-2 border-white shadow-[0_0_20px_white]"}
                    ${screenWidth <= 770 ? "w-full mx-auto" : "w-[60%] ml-0"}`}

                  onClick={() => setFlipped(!flipped)}
                  initial={{ rotateX: 0 }}
                  animate={{ rotateX: flipped ? 180 : 0 }}
                  transition={{ duration: 0.002 }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* FRONT SIDE (Definition) */}
                  {!flipped && (
                    <div className="absolute w-full h-full flex items-center justify-center">
                      <span className={`${starredTerms[studySet.terms[currentIndex].term]
                        ? "text-[#ff7700] drop-shadow-[0_0_8px_#ff7700]"
                        : "text-white drop-shadow-[0_0_8px_white]"}`}>
                        {studySet.terms[currentIndex].definition} {/* or .term for back side */}
                      </span>



                      {/* ⭐ Star Button - Positioned in the top-right corner and clickable */}
                      {isOwner && (
                        <div className="absolute top-2 right-2 flex gap-2 z-10">
                          <button
                            className={`absolute top-0 right-7 text-xl z-10 transition duration-300 ${starredTerms[studySet.terms[currentIndex].term]
                              ? "text-[#ff7700] hover:text-[#ffaa33] drop-shadow-[0_0_8px_#ff7700]"
                              : "text-white hover:text-[#ffaa33] drop-shadow-[0_0_8px_white]"
                              }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStar(studySet.terms[currentIndex].term, studySet._id);
                            }}

                          >
                            {isOwner && starredTerms[studySet.terms[currentIndex].term] ? (
                              <i className="bi bi-star-fill text-yellow-400"></i>
                            ) : (
                              <i className="bi bi-star"></i>
                            )}
                          </button>

                          {/* Pencil Icons */}
                          <button className="absolute top-0 right-0 text-white text-xl z-10 transition duration-300 hover:text-[#ffaa33] hover:scale-110 drop-shadow-[0_0_8px_white]"
                            onClick={(e) => { e.stopPropagation(); handleEditClick(studySet.terms[currentIndex], currentIndex); }}>
                            <i className="bi bi-pencil-fill"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* BACK SIDE (Term) */}
                  {flipped && (
                    <div className="absolute w-full h-full flex items-center justify-center rotate-x-180">
                      <span className={`${starredTerms[studySet.terms[currentIndex].term]
                        ? "text-[#ff7700] drop-shadow-[0_0_8px_#ff7700]"
                        : "text-white drop-shadow-[0_0_8px_white]"}`}>
                        {studySet.terms[currentIndex].term}
                      </span>
                      {/* ⭐ Star Button - Positioned in the top-right corner and clickable */}
                      {isOwner && (
                        <div className="absolute top-2 right-2 flex gap-2 z-10">
                          <button
                            className={`absolute top-0 right-7 text-xl z-10 transition duration-300 ${starredTerms[studySet.terms[currentIndex].term]
                              ? "text-[#ff7700] hover:text-[#ffaa33] drop-shadow-[0_0_8px_#ff7700]"
                              : "text-white hover:text-[#ffaa33] drop-shadow-[0_0_8px_white]"
                              }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStar(studySet.terms[currentIndex].term, studySet._id);
                            }}

                          >
                            {isOwner && starredTerms[studySet.terms[currentIndex].term] ? (
                              <i className="bi bi-star-fill text-yellow-400"></i>
                            ) : (
                              <i className="bi bi-star"></i>
                            )}
                          </button>

                          {/* Pencil Icons */}
                          <button className="absolute top-0 right-0 text-white text-xl z-10 transition duration-300 hover:text-[#ffaa33] hover:scale-110 drop-shadow-[0_0_8px_white]"
                            onClick={(e) => { e.stopPropagation(); handleEditClick(studySet.terms[currentIndex], currentIndex); }}>
                            <i className="bi bi-pencil-fill"></i>
                          </button>
                        </div>
                      )}

                    </div>
                  )}
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Smooth Scroll Slider to Flip Cards Like Chapters */}
            <div className="flex w-[60%]">
              <div className={`flex items-center gap-4 mt-6 ${screenWidth > 770 ? "w-[240px] mx-auto justify-center" : "w-[240px] mx-auto justify-center"}`}>
                <input
                  type="range"
                  min="0"
                  max={studySet.terms.length - 1}
                  value={currentIndex}
                  onChange={(e) => {
                    const index = parseInt(e.target.value);
                    setCurrentIndex(index);
                    setFlipped(false);
                    resetScrollPauseTimer();
                  }}
                  className="w-full transition-all duration-300 
                 accent-[#00e0ff] 
                 hover:accent-[#ffaa33] 
                 bg-black 
                 rounded-lg 
                 h-2 
                 appearance-none 
                 shadow-[0_0_10px_#00e0ff]"
                  style={{
                    accentColor: "#00e0ff",
                  }}
                />
              </div>
            </div>

            {/* Navigation Buttons - Centered Under Flashcard */}
            <div className="flex w-full mt-4">
              <div className={`flex items-center gap-4 ${screenWidth > 770 ? "flex justify-center w-[60%]" : "w-full justify-center"}`}>
                <button
                  onClick={prevCard}
                  className="w-[85px] h-[45px] bg-black text-white border-2 border-white rounded-[35px] text-4xl flex items-center justify-center transition duration-300 hover:bg-white hover:text-black shadow-[0_0_12px_white]"
                >
                  ←
                </button>

                <span className="text-xl text-white drop-shadow-[0_0_8px_white] flex items-center justify-center h-[45px]">
                  {currentIndex + 1} / {studySet.terms.length}
                </span>

                <button
                  onClick={nextCard}
                  className="w-[85px] h-[45px] bg-black text-white border-2 border-white rounded-[35px] text-4xl flex items-center justify-center transition duration-300 hover:bg-white hover:text-black shadow-[0_0_12px_white]"
                >
                  →
                </button>
              </div>
            </div>
            ˝
            {/* Neon Blue Line */}
            <div className={`mt-6 h-[2px] bg-[#00e0ff] ${screenWidth <= 770 ? "w-full" : "w-[60%] ml-0"}`}></div>

            {/* Term List Below Flashcard */}
            <div className={`mt-4 ${screenWidth > 770 ? "w-[60%]" : "w-full"}`}>
              <h3 className="text-lg text-[#00e0ff] drop-shadow-[0_0_8px_#00e0ff] font-semibold mb-2">{t.terminset} ({studySet.terms.length})</h3>

              <div className="flex flex-col gap-2">
                {studySet.terms.map((item, index) => (
                  <div key={index}
                    className={`bg-[#1a2e30] p-4 rounded-lg flex items-center justify-between w-full transition-all duration-300
                  ${starredTerms[item.term] ? "border-2 border-[#ff7700] shadow-[0_0_12px_#ff7700]"
                        : "border-2 border-[#00e0ff] shadow-[0_0_12px_#00e0ff]"}`}
                  >
                    <span className="font-semibold w-1/3 text-white">{item.term}</span>
                    <span className="text-[#00e0ff] text-5xl px-1 font-light drop-shadow-[0_0_8px_#00e0ff]">|</span> {/* Vertical Line */}
                    <span className="text-[#00e0ff] w-2/3">{item.definition}</span>

                    {/* ⭐ Star & ✏️ Edit Buttons Container */}
                    {isOwner && (
                      <div className="relative flex items-center pl-8">
                        {/* Star Button - Positioned at the top-right */}
                        <button
                          onClick={() => toggleStar(item.term, studySet._id)}
                          className="absolute bottom-0 right-0 text-white text-xl"
                        >
                          {isOwner && starredTerms[item.term] ? (
                            <i className="bi bi-star-fill text-[#ff7700] hover:text-[#ffaa33] drop-shadow-[0_0_8px_#ff7700]"></i>
                          ) : (
                            <i className="bi bi-star text-[#00e0ff] hover:text-[#ffaa33] drop-shadow-[0_0_8px_#00e0ff]"></i>
                          )}
                        </button>

                        {/* ✏️ Pencil Icon (Edit Button) - Positioned lower right */}
                        <button
                          onClick={() => handleEditClick(item, index)}
                          className="absolute top-0 right-0 text-[#00e0ff] text-xl transition duration-300 hover:text-[#ffaa33] hover:scale-110 drop-shadow-[0_0_8px_#00e0ff]"
                        >
                          <i className="bi bi-pencil-fill"></i>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add or Remove Term Button */}

              {isOwner && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => {
                      setIsEditingSet(studySet);
                      setIsCreatingSet(false);
                    }}
                    className="px-6 py-2 rounded-lg border border-[#ff7700] text-[#ff7700] transition duration-300 hover:bg-[#ff7700] hover:text-black shadow-md hover:shadow-[0_0_12px_#ff7700]"
                  >
                    {t.addorremove}
                  </button>
                </div>
              )}


            </div>
          </div>
        )}
        {isEditing && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div
              className="bg-black p-6 rounded-lg text-white relative border border-[#00e0ff] shadow-[0_0_16px_#00e0ff] z-50"
              style={{ width: screenWidth > 450 ? "450px" : "100%" }}
            >

              <button
                className="absolute top-2 right-2 text-[#ff7700] text-xl hover:scale-110 transition"
                onClick={() => setIsEditing(false)}
              >
                ✖
              </button>

              <h2 className="text-2xl font-bold mb-4 text-[#ff7700]">{t.editterm}</h2>

              <label className="block mb-2 text-[#00e0ff]">{t.term}</label>
              <input
                type="text"
                className="bg-black text-[#ff7700] placeholder-[#00e0ff] px-4 py-2 rounded-lg w-full mb-4 
                   border border-[#00e0ff] shadow-[0_0_12px_#00e0ff] focus:outline-none focus:ring-2 focus:ring-[#00e0ff]"
                value={editTerm}
                onChange={(e) => setEditTerm(e.target.value)}
              />

              <label className="block mb-2 text-[#00e0ff]">{t.definition}</label>
              <textarea
                className="bg-black text-[#ff7700] placeholder-[#00e0ff] px-4 py-2 rounded-lg w-full mb-4 
                   border border-[#00e0ff] shadow-[0_0_12px_#00e0ff] focus:outline-none focus:ring-2 focus:ring-[#00e0ff]"
                value={editDefinition}
                onChange={(e) => setEditDefinition(e.target.value)}
              />

              <button
                onClick={handleSaveEdit}
                className="px-6 py-2 rounded-lg border border-[#ff7700] text-[#ff7700] transition duration-300 
                   hover:bg-[#ff7700] hover:text-black shadow-md hover:shadow-[0_0_12px_#ff7700]"
              >
                {t.donebt}
              </button>
            </div>
          </div>
        )}
      </div>
    </div >
  );
}

