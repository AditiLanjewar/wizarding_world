import React from 'react';
import PropTypes from 'prop-types';
import ButtonNew from '@components/ButtonNew';
import Image from '@components/Image';
import CloudRevealAnimation from '@components/CloudRevealAnimation';
import { trackClickEvent } from '@utils/analytics';
import useVerticalIndex from '@/src/hooks/useVerticalIndex';
import { useInView } from 'react-intersection-observer';
import AnchorLink from '../../AnchorLink';
import s from './HomeHero.module.scss';

const propTypes = {
  backgroundImage: PropTypes.shape({
    image: PropTypes.shape({
      file: PropTypes.shape({
        url: PropTypes.string,
      }),
    }),
  }),
  mobileBackgroundImage: PropTypes.shape({
    image: PropTypes.shape({
      file: PropTypes.shape({
        url: PropTypes.string,
      }),
    }),
  }),
  orientation: PropTypes.oneOf(['left', 'right', 'center']),
  header: PropTypes.string,
  subheader: PropTypes.string,
  ctaLabel: PropTypes.string,
  ctaURL: PropTypes.string,
  contentfulId: PropTypes.string,
  contentTypeId: PropTypes.string,
  delayReveal: PropTypes.bool,
};

const HomeHero = ({
  backgroundImage = {},
  mobileBackgroundImage = {},
  orientation = 'left',
  header = '',
  subheader = '',
  ctaLabel = '',
  ctaURL = '',
  contentfulId = '',
  contentTypeId = '',
  delayReveal = false,
}) => {
  const { componentRef, verticalIndex } = useVerticalIndex();
  const [ref, inView] = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  return (
    <CloudRevealAnimation inView={!delayReveal && inView}>
      <div
        ref={ref}
        style={{
          '--image': `url(${backgroundImage?.image?.file?.url})`,
        }}
        className={[s.root, s[orientation], inView && !delayReveal ? s.animate : ''].join(' ')}
      >
        <div className={s.mobileImage}>
          <Image imageSet={[{ src: mobileBackgroundImage?.image?.file?.url }]} />
        </div>
        <div className={s.inner} ref={componentRef}>
          <div className={s.absoluteContent}>
            {header && <h2 className={s.header}>{header}</h2>}
            {subheader && <p className={s.subHeader}>{subheader}</p>}
            {ctaLabel && ctaURL && (
              <AnchorLink
                href={ctaURL}
                onClick={() => {
                  trackClickEvent(
                    {
                      destination_url: ctaURL,
                      label: ctaLabel,
                      location: 'Hero',
                      vertical_index: verticalIndex,
                      horizontal_index: 0,
                      content_name: header,
                    },
                    { contentfulId, contentTypeId },
                  );
                }}
              >
                <ButtonNew
                  theme="modern"
                  level="primary"
                  label={ctaLabel}
                  className={[s.cta, s.mobileOnly].join(' ')}
                />
                <ButtonNew
                  theme="modern"
                  level="secondary"
                  label={ctaLabel}
                  className={[s.cta, s.desktopOnly].join(' ')}
                />
              </AnchorLink>
            )}
          </div>
        </div>
      </div>
    </CloudRevealAnimation>
  );
};

HomeHero.propTypes = propTypes;
export default HomeHero;
