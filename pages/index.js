import Head from 'next/head';
import Image from 'next/image';
import React from 'react';
import {motion, useMotionValue, useTransform} from 'framer-motion';

import styles from '../styles/Home.module.css';
import {useInView} from 'react-intersection-observer';

// eslint-disable-next-line react/display-name
const Item = React.forwardRef((props, ref) => {
  return (
    <div
      ref={ref}
      className='bg-white rounded-lg p-10  flex items-center justify-center'
    >
      <p className='text-lg font-bold'>{props.num}</p>
    </div>
  );
});

export default function Home() {
  const [parentEl, setParentEl] = React.useState(null);
  const [itemHeight, setItemHeight] = React.useState(null);
  const [parentHeight, setParentHeight] = React.useState(null);
  const [numOfItems, setNumOfItems] = React.useState(15);
  const scrollY = useMotionValue(0);
  const scale = useTransform(scrollY, [0, 100], [0, 1]);
  const opacity = useTransform(scrollY, [0, 100], [0, 1]);

  const {ref: inViewRef, inView} = useInView({
    threshold: 0,
  });

  React.useEffect(() => {
    if (inView) {
      if (numOfItems < 100) {
        setNumOfItems((state) => state + 10);
      }
    }
  }, [inView]);

  const getBodyRef = (node) => {
    if (node && !parentHeight) {
      const {height} = node.getBoundingClientRect();
      setParentHeight(height);
    }
  };

  const getWrapperRef = (node) => {
    if (node) {
      // const {height} = node.getBoundingClientRect();
      setParentEl(node);
    }
  };

  const getItemRef = React.useCallback(
    (node) => {
      if (node && !itemHeight) {
        const {height} = node.getBoundingClientRect();
        setItemHeight(height);
      }
    },
    [itemHeight, setItemHeight]
  );

  const getWrapperHeight = React.useCallback(
    (itemHeight) => {
      if (!parentEl) return 0;
      const paddingLength = 8;
      const rowLength = Math.ceil(parentEl.children.length / 2);
      const totalPaddingLength = (rowLength + 1) * paddingLength;
      const totalHeight = rowLength * itemHeight + totalPaddingLength;
      return totalHeight;
    },
    [parentEl]
  );

  const dragTopConstraint = React.useCallback(
    () =>
      getWrapperHeight(itemHeight) > parentHeight
        ? -getWrapperHeight(itemHeight) + parentHeight
        : 0,
    [getWrapperHeight, itemHeight, parentHeight]
  );

  return (
    <div className='fixed inset-0 flex items-center justify-center'>
      <div className='border-8 border-black/70 flex flex-col overflow-hidden w-full h-full'>
        <div className='bg-slate-700 p-10 text-white text-center'>
          <h1 className='text-3xl'>HEADER</h1>
        </div>

        <motion.div
          className='flex-grow bg-zinc-300 overflow-hidden relative'
          style={{
            transform: 'translateZ(0)',
            cursor: 'grab',
          }}
          whileTap={{cursor: 'grabbing'}}
          ref={getBodyRef}
        >
          <motion.div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: '#fff',
              position: 'absolute',
              top: 15,
              left: '50%',
              marginLeft: -20,
              scale: scale,
              opacity: opacity,
            }}
          />
          <motion.div
            style={{
              y: scrollY,
              height: itemHeight ? getWrapperHeight(itemHeight) : 0,
            }}
            drag='y'
            onDragEnd={() => {
              if (scrollY.get() > 110) {
                setNumOfItems(0);
              }
            }}
            onDrag={(event, info) => {
              console.log(info.point.x, info.point.y);
            }}
            dragConstraints={{
              top: dragTopConstraint(),
              bottom: 0,
            }}
            dragElastic={{
              top: 0,
              bottom: 0.5,
            }}
            ref={getWrapperRef}
            className='body grid grid-cols-2 p-2 gap-2 w-full'
          >
            {Array.from({length: numOfItems}).map((_, i) => (
              <Item
                ref={getItemRef}
                num={i}
                key={i}
                className='bg-white rounded-lg p-3 h-[80px]'
              />
            ))}
            <div ref={inViewRef} className='text-center col-span-2'>
              <p>load more...</p>
            </div>
          </motion.div>
        </motion.div>
        <div className='bg-cyan-600 p-5 text-white text-center'>
          <h1 className='text-3xl'>FOOTER</h1>
        </div>
      </div>
    </div>
  );
}
