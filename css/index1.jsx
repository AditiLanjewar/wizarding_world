/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import FocusLock from 'react-focus-lock';
import { useRouter } from 'next/router';
import SharedLib from 'wizarding-world-web-shared';
import { useGlobalState as useNavigationGlobalState } from '@/src/globalStates/NavigationState';
import { HOME_URL, PROFILE, LOGIN } from '@constants/routes';
import { AUTH_BACK_BTN_REDIRECT } from '@constants/index';
import { trackClickEvent } from '@utils/analytics';
import SearchInput from '@components/SearchInput';
import SearchInputMobile from '@components/SearchInputMobile';
import { AVATAR_LOCAL_IMAGE } from '@constants/avatar-maker';
import searchImage from '../../images/icons/search.svg';
import Image from '../Image';
import AnchorLink from '../AnchorLink';
import s from './Header.module.scss';
import Logo from '../Logo';
import HamburgerMenu from '../HamburgerMenu';
import { useUserContext } from '../../contexts/user-context';
import HouseAvatar from '../HouseAvatar';
import HourglassSpinner from '../HourglassSpinner';
import Navigation from '../Navigation';
import SignUpBtn from '../SignUpBtn';
import NavRibbon from '../NavRibbon';
import SocialShareLinks from '../SocialShareLinks';

const propTypes = {
  navData: PropTypes.objectOf(PropTypes.any).isRequired,
};

const Header = ({ navData }) => {
  const searchFeatureFlag = process.env.REACT_APP_SEARCH_ENABLED === 'TRUE';
  const [showSearch, setShowSearch] = useState(false);
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { profile, isLoggedIn, loadingProfile, loading } = useUserContext();
  const [avatarImage, setAvatarImage] = useState(null);
  const { setCookie } = SharedLib.utils.cookie;
  const [blur] = useNavigationGlobalState('blur');
  const [navigationHiddenByScroll, setNavigationHiddenByScroll] = useNavigationGlobalState(
    'navigationHiddenByScroll',
  );
  const [navRibbonActive, setNavRibbonActive] = useNavigationGlobalState('navRibbonActive');

  useEffect(() => {
    let handleScroll;

    /* istanbul ignore else */
    if (typeof window !== 'undefined') {
      let lastScrollY = window.scrollY;

      /* istanbul ignore next */
      handleScroll = () => {
        const scrollAmount = navRibbonActive ? 159 : 120;
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY && currentScrollY > scrollAmount) {
          setNavigationHiddenByScroll(true);
        } else if (currentScrollY < lastScrollY || currentScrollY <= scrollAmount) {
          setNavigationHiddenByScroll(false);
        }
        lastScrollY = currentScrollY;
      };

      window.addEventListener('scroll', handleScroll);
    }
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [setNavigationHiddenByScroll]);

  useEffect(() => {
    setNavigationHiddenByScroll(false);
  }, [router.pathname]);

  useEffect(() => {
    setNavRibbonActive(navData?.showRibbon);
  }, [navData.showRibbon, setNavRibbonActive]);

  const handleCloseSidebar = (state) => {
    setSidebarOpen(!state);
  };

  const onSearchFocus = () => {
    if (isSidebarOpen) {
      setSidebarOpen(false);
    }
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
  };

  useEffect(() => {
    setAvatarImage(profile?.avatar?.url || localStorage.getItem(AVATAR_LOCAL_IMAGE));
  }, [profile]);

  return (
    <div
      className={[s.headerRoot, navigationHiddenByScroll ? s.hideNav : ''].join(' ')}
      data-testid="header-root"
    >
      {showSearch && <SearchInputMobile onCancel={toggleSearch} />}
      <div className={s.socialShareLinks}>
        <SocialShareLinks
          socialMediaItems={navData.socialMediaItems}
          mobile={false}
          analyticsParams={{
            location: 'Nav Bar',
            vertical_index: 0,
          }}
        />
      </div>
      <FocusLock autoFocus={false} group="navigation" disabled={!isSidebarOpen}>
        <button
          aria-labelledby="wizarding_world_menu"
          type="button"
          data-group="navigation"
          id="hamBurgerMenu"
          data-testid="hamBurgerMenu"
          title={`${isSidebarOpen ? 'Close' : 'Open'} Sidebar Menu`}
          className={[s.hamburgerBtn, isSidebarOpen ? s.sideBarOpen : ''].join(' ')}
          onMouseDown={(e) => {
            e.preventDefault();
          }}
          onClick={() => {
            if (isSidebarOpen) {
              setSidebarOpen(false);
            } else {
              setSidebarOpen(true);
            }
            document.activeElement.blur();
          }}
        >
          <HamburgerMenu open={isSidebarOpen} />
        </button>
        <button
          name="Search button"
          data-testid="Search button"
          type="button"
          className={s.searchButton}
          onClick={() => toggleSearch()}
        >
          <Image imageSet={[{ src: searchImage }]} />
        </button>
      </FocusLock>
      <div className={s.container}>
        <div data-testid="headerRoot" className={[s.root, blur ? s.blur : ''].join(' ')}>
          <div className={s.itemCenter}>
            <AnchorLink
              href={HOME_URL}
              title="Home Page"
              className={s.logo}
              prefetch={false}
              data-testid="wizardingWorldLogo"
              onClick={() => {
                trackClickEvent({
                  destination_url: '/',
                  label: 'Wizarding World Logo',
                  location: 'Nav Bar',
                  vertical_index: 0,
                  horizontal_index: 0,
                });
              }}
            >
              <Logo />
            </AnchorLink>
          </div>
          <div className={[s[!isLoggedIn ? 'loggedOut' : ''], s.itemRight].join(' ')}>
            {searchFeatureFlag && <SearchInput onSearchFocus={onSearchFocus} />}
            {isLoggedIn && (
              <AnchorLink
                href={PROFILE}
                id="login"
                tabIndex="-1"
                aria-labelledby="wizarding_world_profile"
                data-testid="wizarding_world_profile"
                prefetch={false}
                title={`${
                  // eslint-disable-next-line no-nested-ternary
                  !loadingProfile ? profile.hogwartsHouse || 'No House' : ''
                }`}
              >
                <button
                  type="button"
                  className={s.crest}
                  id="wizarding_world_profile"
                  data-testid="WizardingWorldProfileBtn"
                  onClick={() => {
                    trackClickEvent({
                      destination_url: PROFILE,
                      label: 'Profile',
                      location: 'Nav Bar',
                      vertical_index: 0,
                      horizontal_index: 0,
                    });
                  }}
                >
                  {isLoggedIn && !loadingProfile && (
                    <HouseAvatar avatarImage={avatarImage} house={profile.hogwartsHouse} />
                  )}
                  {loadingProfile && (
                    <div
                      data-testid="HourglassSpinnerLoadingProfile"
                      className={s.hourglassSpinner}
                    >
                      <HourglassSpinner />
                    </div>
                  )}
                </button>
              </AnchorLink>
            )}
            {!loadingProfile && !isLoggedIn && !loading && (
              <>
                <button
                  type="button"
                  className={s.loginButtonText}
                  id="wizarding_world_login"
                  data-testid="wizarding_world_login"
                  onClick={() => {
                    setCookie({
                      name: AUTH_BACK_BTN_REDIRECT,
                      value: window.location.pathname,
                      expires: 365 * 24 * 60 * 60,
                    });
                    trackClickEvent({
                      destination_url: LOGIN,
                      label: 'LOG IN',
                      location: 'Nav Bar',
                      vertical_index: 0,
                      horizontal_index: 0,
                    });
                    router.push(LOGIN);
                  }}
                >
                  LOG IN
                </button>
                <SignUpBtn />
              </>
            )}
            {loadingProfile && !isLoggedIn && (
              <div data-testid="HourglassSpinnerNotLoggedIn" className={s.hourglassSpinner}>
                <HourglassSpinner />
              </div>
            )}
          </div>
        </div>
        {navRibbonActive && <NavRibbon navData={navData} />}
        <FocusLock autoFocus={false} group="navigation" disabled={!isSidebarOpen}>
          <Navigation
            isSidebarOpen={isSidebarOpen}
            closeSidebar={handleCloseSidebar}
            navData={navData}
          />
        </FocusLock>
      </div>
    </div>
  );
};

Header.propTypes = propTypes;
export default Header;
