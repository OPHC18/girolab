'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { CAT_COLORS, CAT_NAMES, CAT_GROUPS, NIVEL_NAMES, type Emotion } from './emotions'
import { EMOTIONS } from './emotionsData'

/* ─────────────────────────────────────────────────────────────────────────── */

const SVG_CONTENT = `<svg id="universo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1486.76">
  <defs>
    <style>
      .cls-1 {
        letter-spacing: -.01em;
      }

      .cls-2 {
        letter-spacing: 0em;
      }

      .cls-3 {
        letter-spacing: -.01em;
      }

      .cls-4 {
        letter-spacing: 0em;
      }

      .cls-5 {
        letter-spacing: 0em;
      }

      .cls-6 {
        font-size: 8px;
      }

      .cls-6, .cls-7, .cls-8, .cls-9, .cls-10, .cls-11, .cls-12, .cls-13, .cls-14, .cls-15, .cls-16, .cls-17, .cls-18, .cls-19, .cls-20, .cls-21, .cls-22, .cls-23, .cls-24, .cls-25, .cls-26, .cls-27, .cls-28 {
        fill: none;
      }

      .cls-6, .cls-10, .cls-19, .cls-29, .cls-21, .cls-24, .cls-27 {
        font-family: RalewayRoman-Medium, Raleway;
        font-variation-settings: 'wght' 500;
        font-weight: 500;
      }

      .cls-7 {
        opacity: .35;
      }

      .cls-7, .cls-8, .cls-12, .cls-15, .cls-17, .cls-18, .cls-20, .cls-22, .cls-23, .cls-25, .cls-28 {
        mix-blend-mode: multiply;
      }

      .cls-30 {
        letter-spacing: -.02em;
      }

      .cls-31 {
        letter-spacing: -.03em;
      }

      .cls-8 {
        opacity: .8;
      }

      .cls-9 {
        font-family: RalewayRoman-Bold, Raleway;
        font-size: 11.91px;
        font-variation-settings: 'wght' 700;
        font-weight: 700;
      }

      .cls-32 {
        letter-spacing: -.03em;
      }

      .cls-10 {
        font-size: 9.39px;
      }

      .cls-33 {
        letter-spacing: -.11em;
      }

      .cls-11 {
        font-family: RalewayRoman-Regular, Raleway;
        font-size: 10.3px;
        font-variation-settings: 'wght' 400;
      }

      .cls-12 {
        opacity: .6;
      }

      .cls-34 {
        letter-spacing: -.02em;
      }

      .cls-35 {
        letter-spacing: -.01em;
      }

      .cls-36 {
        letter-spacing: -.02em;
      }

      .cls-37 {
        letter-spacing: -.02em;
      }

      .cls-38 {
        letter-spacing: 0em;
      }

      .cls-39 {
        letter-spacing: 0em;
      }

      .cls-40 {
        letter-spacing: -.01em;
      }

      .cls-41 {
        letter-spacing: 0em;
      }

      .cls-42 {
        letter-spacing: -.01em;
      }

      .cls-14 {
        opacity: .21;
      }

      .cls-43 {
        letter-spacing: 0em;
      }

      .cls-44 {
        letter-spacing: -.02em;
      }

      .cls-45 {
        isolation: isolate;
      }

      .cls-46 {
        letter-spacing: -.03em;
      }

      .cls-15 {
        opacity: .59;
      }

      .cls-47 {
        letter-spacing: 0em;
      }

      .cls-16 {
        opacity: .98;
      }

      .cls-48 {
        letter-spacing: 0em;
      }

      .cls-49 {
        letter-spacing: -.01em;
      }

      .cls-50 {
        letter-spacing: 0em;
      }

      .cls-51 {
        letter-spacing: 0em;
      }

      .cls-52 {
        letter-spacing: 0em;
      }

      .cls-53 {
        letter-spacing: 0em;
      }

      .cls-54 {
        letter-spacing: -.03em;
      }

      .cls-17 {
        opacity: .75;
      }

      .cls-55 {
        letter-spacing: -.01em;
      }

      .cls-56 {
        letter-spacing: -.01em;
      }

      .cls-57 {
        letter-spacing: -.03em;
      }

      .cls-18, .cls-26 {
        opacity: .51;
      }

      .cls-58 {
        letter-spacing: -.01em;
      }

      .cls-19 {
        font-size: 12px;
      }

      .cls-59 {
        letter-spacing: 0em;
      }

      .cls-60 {
        letter-spacing: 0em;
      }

      .cls-20 {
        opacity: .5;
      }

      .cls-61 {
        letter-spacing: -.02em;
      }

      .cls-62 {
        letter-spacing: 0em;
      }

      .cls-29 {
        fill: #fd8000;
        font-size: 9.18px;
      }

      .cls-63 {
        letter-spacing: -.02em;
      }

      .cls-21 {
        font-size: 8.08px;
      }

      .cls-64 {
        letter-spacing: 0em;
      }

      .cls-65 {
        letter-spacing: -.05em;
      }

      .cls-66 {
        letter-spacing: 0em;
      }

      .cls-67 {
        letter-spacing: 0em;
      }

      .cls-68 {
        letter-spacing: 0em;
      }

      .cls-69 {
        letter-spacing: 0em;
      }

      .cls-22 {
        opacity: .39;
      }

      .cls-23 {
        opacity: .2;
      }

      .cls-24 {
        font-size: 7.11px;
      }

      .cls-70 {
        letter-spacing: -.01em;
      }

      .cls-71 {
        letter-spacing: -.01em;
      }

      .cls-25 {
        opacity: .37;
      }

      .cls-72 {
        letter-spacing: 0em;
      }

      .cls-73 {
        letter-spacing: 0em;
      }

      .cls-27 {
        font-size: 8.59px;
      }

      .cls-28 {
        opacity: .3;
      }
    </style>
  </defs>
  <g class="cls-45">
    <g id="prisma_central">
      <line id="prisma_central_positivas" class="cls-23" x1="552.76" y1="227.09" x2="290.81" y2="488.27"/>
      <line id="prisma_central_positivas-2" data-name="prisma_central_positivas" class="cls-23" x1="552.25" y1="227.09" x2="814.21" y2="488.27"/>
      <line id="prisma_central_positivas-3" data-name="prisma_central_positivas" class="cls-23" x1="290.81" y1="488.27" x2="814.21" y2="488.27"/>
      <line id="prisma_central_negativas" class="cls-23" x1="552.25" y1="1284.03" x2="814.21" y2="1022.85"/>
      <line id="prisma_central_negativas-2" data-name="prisma_central_negativas" class="cls-23" x1="294.53" y1="1023.25" x2="814.21" y2="1022.85"/>
      <line id="prisma_central_negativas-3" data-name="prisma_central_negativas" class="cls-23" x1="552.76" y1="1284.03" x2="290.81" y2="1022.85"/>
      <line id="prisma_central_diferencia" class="cls-23" x1="289.26" y1="1020.43" x2="290.81" y2="488.27"/>
      <line id="prisma_central_diferencia-2" data-name="prisma_central_diferencia" class="cls-23" x1="391.89" y1="831.27" x2="290.81" y2="488.27"/>
      <line id="prisma_central_diferencia-3" data-name="prisma_central_diferencia" class="cls-23" x1="213.43" y1="840.43" x2="168.24" y2="359.94"/>
      <line id="prisma_central_diferencia-4" data-name="prisma_central_diferencia" class="cls-23" x1="319.37" y1="817.84" x2="215.93" y2="603.51"/>
      <line id="prisma_central_diferencia-5" data-name="prisma_central_diferencia" class="cls-23" x1="332.35" y1="852.15" x2="438.74" y2="540.82"/>
      <line id="prisma_central_diferencia-6" data-name="prisma_central_diferencia" class="cls-23" x1="806.2" y1="865.81" x2="667.46" y2="512.42"/>
      <line id="prisma_central_diferencia-7" data-name="prisma_central_diferencia" class="cls-23" x1="706.64" y1="1058.86" x2="827.18" y2="588.14"/>
      <line id="prisma_central_diferencia-8" data-name="prisma_central_diferencia" class="cls-23" x1="650.78" y1="1067.69" x2="978.96" y2="509.86"/>
      <line id="prisma_central_diferencia-9" data-name="prisma_central_diferencia" class="cls-23" x1="816.4" y1="1021.4" x2="819.58" y2="488.27"/>
      <path id="puntos_cuatro" class="cls-13" d="M530.05,299.46c138.33,97.6,198.92,276.08,101.34,387.26-97.58,111.18-377.83,57.76-470.4-21.56C32.43,555-11.62,388.63,101.24,293c94.32-79.92,282.45-96.81,428.81,6.46Z"/>
      <path id="puntos_tres" class="cls-13" d="M640.01,282.47c127.23,111.67,475.35,750.54,412.04,902.72-32.75,78.71-175.97,128.48-285.6,75.16-240.63-117.03-547.46-893.09-448.25-1061.91,71.78-122.14,194.58-27.65,321.81,84.03Z"/>
      <path id="puntos_dos" class="cls-13" d="M742.45,912.21c-153.74,249.95-243.82,385.64-389.44,334.07-109.29-38.71-99.61-363.54,62.7-608,162.31-244.46,291.05-428.81,436.81-351.04,51.35,27.39,44.78,373.22-110.07,624.97Z"/>
      <path id="puntos_uno" class="cls-13" d="M888.2,680.43c86.4,115.13,198.59,290.3-127.45,453.96-159.48,86.55-274.69-31.59-397.37-172.43-206.34-236.89-84.74-335.5,74.74-422.06,129.26-55.96,363.68,25.4,450.08,140.53Z"/>
    </g>
    <g id="cometas">
      <g id="cometa_esperanza">
        <ellipse id="cometa_esperanza_ca" class="cls-26" cx="926.19" cy="731.68" rx="26.53" ry="26.05" transform="translate(-39.31 1410.64) rotate(-73.42)"/>
        <ellipse id="cometa_esperanza_cb" class="cls-13" cx="925.99" cy="731.57" rx="6.86" ry="7.11" transform="translate(-39.35 1410.36) rotate(-73.42)"/>
      </g>
      <g id="cometa_pasion">
        <ellipse id="cometa_pasion_ca" class="cls-26" cx="255.09" cy="735.26" rx="25.17" ry="24.71" transform="translate(-522.39 769.98) rotate(-73.42)"/>
        <ellipse id="cometa_pasion_cb" class="cls-13" cx="254.68" cy="735.14" rx="10.43" ry="8.39" transform="translate(-522.57 769.5) rotate(-73.42)"/>
      </g>
      <g id="cometa_valores">
        <path id="cometa_ca" class="cls-14" d="M177.19,260.02c0,13.94-18.88,30.4-35.14,24.2-9.99-3.81-16.65-9.97-15.78-22.46.74-10.67,9.68-23.23,30.3-23.23,10.69,0,20.62,10.8,20.62,21.49Z"/>
        <path id="cometa_cb" class="cls-13" d="M162.62,261.17c0,6-8.13,13.09-15.13,10.42-4.3-1.64-7.17-4.29-6.79-9.67.32-4.59,4.17-10,13.04-10,4.6,0,8.88,4.65,8.88,9.25Z"/>
      </g>
    </g>
    <g id="felicidad">
      <g id="felicidad_nivel_uno">
        <circle id="felicidad_felicidad_nivel_uno_ca" class="cls-25" cx="550.9" cy="227.66" r="176.94"/>
        <circle id="felicidad_felicidad_nivel_uno_cb" class="cls-13" cx="552.76" cy="229.75" r="22.46"/>
        <text id="felicidad_felicidad_nivel_uno_tx" class="cls-9" transform="translate(465.04 235.6)"><tspan x="0" y="0">FELICI</tspan><tspan class="cls-32" x="35.92" y="0">D</tspan><tspan class="cls-2" x="44.12" y="0">AD</tspan></text>
      </g>
      <g id="felicidad_nivel_dos">
        <g id="equilibrio_felicidad">
          <circle id="equilibrio_felicidad_nivel_dos_ca" class="cls-25" cx="697.71" cy="207.66" r="67.22"/>
          <circle id="equilibrio_felicidad_nivel_dos_cb" class="cls-13" cx="701.68" cy="207.76" r="13.39"/>
        </g>
        <g id="satisfaccion_felicidad">
          <circle id="satisfaccion_felicidad_nivel_dos_ca" class="cls-25" cx="496.04" cy="312.37" r="67.22"/>
          <circle id="satisfaccion_felicidad_nivel_dos_cb" class="cls-13" cx="502.17" cy="313.81" r="13.39"/>
        </g>
        <g id="gozo_felicidad">
          <circle id="gozo_felicidad_nivel_dos_ca" class="cls-25" cx="434.01" cy="267.17" r="67.22"/>
          <circle id="gozo_felicidad_nivel_dos_cb" class="cls-13" cx="444.02" cy="266.43" r="13.4"/>
        </g>
        <g id="plenitud_felicidad">
          <circle id="plenitud_felicidad_nivel_dos_ca" class="cls-25" cx="622.2" cy="185.94" r="67.22"/>
          <circle id="plenitud_felicidad_nivel_dos_cb" class="cls-13" cx="633.51" cy="184.4" r="13.39"/>
        </g>
        <g id="armonia_felicidad">
          <circle id="armonia_felicidad_nivel_dos_ca" class="cls-25" cx="630.49" cy="253.16" r="67.22"/>
          <circle id="armonia_felicidad_nivel_dos_cb" class="cls-13" cx="635.65" cy="253.16" r="13.39"/>
        </g>
        <g id="paz_interior_felicidad">
          <circle id="paz_interior_felicidad_nivel_dos_ca" class="cls-25" cx="558.6" cy="75.39" r="67.22"/>
          <circle id="paz_interior_felicidad_nivel_dos_cb" class="cls-13" cx="552.5" cy="67.75" r="14.01"/>
        </g>
        <g id="relajacion_felicidad">
          <circle id="relajacion_felicidad_nivel_dos_ca" class="cls-25" cx="487.75" cy="108.37" r="67.22"/>
          <circle id="relajacion_felicidad_nivel_dos_cb" class="cls-13" cx="481.9" cy="99.9" r="13.71"/>
        </g>
        <g id="tranquilidad_felicidad">
          <circle id="tranquilidad_felicidad_nivel_dos_ca" class="cls-25" cx="533.73" cy="146.76" r="68"/>
          <circle id="tranquilidad_felicidad_nivel_dos_cb" class="cls-13" cx="540" cy="145.34" r="13.41"/>
        </g>
        <g id="serenidad_felicidad">
          <circle id="serenidad_felicidad_nivel_dos_ca" class="cls-25" cx="454.77" cy="148.07" r="67.22"/>
          <circle id="serenidad_felicidad_nivel_dos_cb" class="cls-13" cx="465.04" cy="148.95" r="13.4"/>
        </g>
        <g id="placidez_felicidad">
          <circle id="placidez_felicidad_nivel_dos_ca" class="cls-25" cx="434.01" cy="192.05" r="67.22"/>
          <circle id="placidez_felicidad_nivel_dos_cb" class="cls-13" cx="441.37" cy="207.3" r="13.4"/>
        </g>
        <g id="bienestar_felicidad">
          <circle id="bienestar_felicidad_nivel_dos_ca" class="cls-25" cx="604.5" cy="313.82" r="67.22"/>
          <circle id="bienestar_felicidad_nivel_dos_cb" class="cls-13" cx="609.81" cy="313.89" r="17.77"/>
        </g>
      </g>
      <g id="felicidad_nivel_tres">
        <g id="dicha_felicidad">
          <circle id="dicha_felicidad_nivel_tres_ca" class="cls-25" cx="436.31" cy="320.39" r="26.33"/>
          <circle id="dicha_felicidad_nivel_tres_cb" class="cls-13" cx="443.15" cy="318.23" r="7.07"/>
        </g>
        <g id="seguridad_felicidad">
          <circle id="seguridad_felicidad_nivel_tres_ca" class="cls-25" cx="433.22" cy="168.08" r="26.33"/>
          <circle id="seguridad_felicidad_nivel_tres_cb" class="cls-13" cx="425.85" cy="169.42" r="7.07"/>
        </g>
        <g id="mindfulness_felicidad">
          <circle id="mindfulness_felicidad_nivel_tres_ca" class="cls-25" cx="435.39" cy="117.24" r="26.87"/>
          <circle id="mindfulness_felicidad_nivel_tres_cb" class="cls-13" cx="436.68" cy="108.66" r="6.94"/>
          <text id="mindfulness_felicidad_nivel_tres_tx" class="cls-11" transform="translate(368.28 117.24)"><tspan x="0" y="0">Mindfulness</tspan></text>
        </g>
        <g id="meditacion_felicidad">
          <circle id="meditacion_felicidad_nivel_tres_ca" class="cls-25" cx="447.4" cy="78.76" r="26.87"/>
          <circle id="meditacion_felicidad_nivel_tres_cb" class="cls-13" cx="447.52" cy="71.43" r="7.37"/>
          <text id="meditacion_felicidad_nivel_tres_tx" class="cls-11" transform="translate(376.16 76.84)"><tspan class="cls-41" x="0" y="0">M</tspan><tspan x="8.95" y="0">editación</tspan></text>
        </g>
        <g id="elevacion_felicidad">
          <circle id="elevacion_felicidad_nivel_tres_ca" class="cls-25" cx="609.32" cy="84.1" r="26.33"/>
          <circle id="elevacion_felicidad_nivel_tres_cb" class="cls-13" cx="612.27" cy="81.04" r="6.92"/>
        </g>
        <g id="florecer_felicidad">
          <circle id="florecer_felicidad_nivel_tres_ca" class="cls-25" cx="664.17" cy="92.38" r="26.33"/>
          <circle id="florecer_felicidad_nivel_tres_cb" class="cls-13" cx="662.74" cy="81.04" r="6.92"/>
        </g>
        <g id="saborear_felicidad">
          <circle id="saborear_felicidad_nivel_tres_ca" class="cls-25" cx="702.71" cy="134.03" r="27.14"/>
          <circle id="saborear_felicidad_nivel_tres_cb" class="cls-13" cx="709.61" cy="136.51" r="6.92"/>
        </g>
        <g id="fluir_felicidad">
          <circle id="fluir_felicidad_nivel_tres_ca" class="cls-25" cx="639.36" cy="135.51" r="27.14"/>
          <circle id="fluir_felicidad_nivel_tres_cb" class="cls-13" cx="640.16" cy="133.58" r="7.14"/>
        </g>
        <g id="sumak_kawsay_felicidad">
          <circle id="sumak_kawsay_felicidad_nivel_tres_ca" class="cls-25" cx="700.01" cy="308.06" r="20.82"/>
          <circle id="sumak_kawsay_felicidad_nivel_tres_cb" class="cls-13" cx="706.85" cy="305.9" r="5.59"/>
        </g>
      </g>
      <g id="felicidad_nivel_cuatro">
        <g id="dulzura_felicidad">
          <circle id="dulzura_felicidad_nivel_cuatro_ca" class="cls-25" cx="407.33" cy="288.34" r="8.43"/>
          <circle id="dulzura_felicidad_nivel_cuatro_cb" class="cls-13" cx="407.33" cy="288.34" r="3.22"/>
        </g>
        <g id="hygge_felicidad">
          <circle id="hygge_felicidad_nivel_cuatro_ca" class="cls-25" cx="471.08" cy="277.19" r="8.43"/>
          <circle id="hygge_felicidad_nivel_cuatro_cb" class="cls-13" cx="471.08" cy="278.69" r="2.79"/>
        </g>
        <g id="sosiego_felicidad">
          <circle id="sosiego_felicidad_nivel_cuatro_ca" class="cls-25" cx="504.43" cy="157.19" r="8.43"/>
          <circle id="sosiego_felicidad_nivel_cuatro_cb" class="cls-13" cx="504.43" cy="157.19" r="3.02"/>
        </g>
        <g id="calma_felicidad">
          <circle id="calma_felicidad_nivel_cuatro_ca" class="cls-25" cx="519.24" cy="100.48" r="8.43"/>
          <circle id="calma_felicidad_nivel_cuatro_cb" class="cls-13" cx="519.24" cy="100.48" r="2.75"/>
        </g>
        <g id="compromiso_felicidad">
          <circle id="compromiso_felicidad_nivel_cuatro_ca" class="cls-25" cx="593.29" cy="97.83" r="8.43"/>
          <circle id="compromiso_felicidad_nivel_cuatro_cb" class="cls-13" cx="593.29" cy="97.83" r="1.92"/>
        </g>
      </g>
      <g id="felicidad_lineas">
        <line class="cls-13" x1="452.78" y1="264.58" x2="538.82" y2="236.6"/>
        <line class="cls-13" x1="446.26" y1="210.68" x2="537.28" y2="227.04"/>
        <line class="cls-13" x1="468.19" y1="155.17" x2="540.98" y2="218.16"/>
        <line class="cls-13" x1="486.62" y1="109.91" x2="546.32" y2="215.76"/>
        <line class="cls-13" x1="542.14" y1="159.47" x2="550.51" y2="210.68"/>
        <line class="cls-13" x1="554.98" y1="79.76" x2="556.61" y2="213.62"/>
        <line class="cls-13" x1="630.49" y1="188.66" x2="568.76" y2="222.35"/>
        <line class="cls-13" x1="683.98" y1="211.95" x2="565.04" y2="228.08"/>
        <line class="cls-13" x1="622.66" y1="250.08" x2="568.76" y2="235.2"/>
        <line class="cls-13" x1="563.27" y1="244.08" x2="604.5" y2="304.93"/>
        <line class="cls-13" x1="544.76" y1="246.15" x2="506.36" y2="306.24"/>
        <line class="cls-13" x1="442.52" y1="278.19" x2="443.15" y2="317.14"/>
        <line class="cls-13" x1="438.38" y1="80.6" x2="429.84" y2="108.42"/>
        <line class="cls-13" x1="468.78" y1="104.89" x2="431.36" y2="111.75"/>
        <line class="cls-13" x1="480.56" y1="118.88" x2="465.04" y2="139.3"/>
        <line class="cls-13" x1="490.05" y1="108.32" x2="535.35" y2="142.74"/>
        <line class="cls-13" x1="547.53" y1="78.6" x2="537.68" y2="137.99"/>
        <line class="cls-13" x1="538.56" y1="72.71" x2="489.94" y2="95.72"/>
        <line class="cls-13" x1="558.6" y1="78.6" x2="621.94" y2="173.86"/>
        <line class="cls-13" x1="634.94" y1="135.03" x2="564.38" y2="221.1"/>
        <line class="cls-13" x1="658.28" y1="86.4" x2="708.2" y2="135.14"/>
        <line class="cls-13" x1="704.84" y1="136.51" x2="640.16" y2="133.58"/>
        <line class="cls-13" x1="636.92" y1="129.12" x2="652.31" y2="86.4"/>
        <line class="cls-13" x1="637.28" y1="187.62" x2="696.68" y2="206.76"/>
        <line class="cls-13" x1="693.46" y1="216.3" x2="644.51" y2="250.08"/>
        <line class="cls-13" x1="633.51" y1="197.19" x2="635.65" y2="246.48"/>
      </g>
    </g>
    <g id="emociones_esteticas">
      <g id="emociones_esteticas_nivel_uno">
        <path id="emociones_esteticas_emociones_esteticas_nivel_uno_ca" class="cls-8" d="M483.76,408.37c-42.28,39.72-41.31,100.16-12.18,130.33,29.13,30.17,77.58,31.17,112.92-2.97,35.35-34.14,43.7-97.4,14.57-127.57-29.13-30.17-79.5-33.44-115.31.21Z"/>
        <ellipse id="emociones_esteticas_emociones_esteticas_nivel_uno_cb" class="cls-13" cx="532.83" cy="469.15" rx="13.86" ry="10.98" transform="translate(-118.42 751.79) rotate(-64.82)"/>
      </g>
      <g id="emociones_esteticas_nivel_cinco">
        <g id="sindrome_de_stendhal_emociones_esteticas">
          <circle id="sindrome_de_stendhal_emociones_esteticas_nivel_cinco_ca" class="cls-13" cx="577.76" cy="450.44" r="7.8"/>
          <circle id="sindrome_de_stendhal_emociones_esteticas_nivel_cinco_cb" class="cls-13" cx="577.76" cy="450.44" r="3.24"/>
          <text id="sindrome_de_stendhal_emociones_esteticas_nivel_cinco_tx" class="cls-6" transform="translate(560.39 461.03)"><tspan x="0" y="0">Sínd</tspan><tspan class="cls-1" x="16.46" y="0">r</tspan><tspan x="19.27" y="0">ome </tspan><tspan x="-4.54" y="9.6">de </tspan><tspan class="cls-71" x="7.25" y="9.6">S</tspan><tspan class="cls-60" x="12.04" y="9.6">t</tspan><tspan x="14.8" y="9.6">endha</tspan><tspan class="cls-31" x="38.43" y="9.6">l</tspan></text>
        </g>
      </g>
    </g>
    <g id="amor">
      <g id="amor_nivel_uno">
        <circle id="amor_amor_nivel_uno_ca" class="cls-15" cx="289.2" cy="480.38" r="178.65"/>
        <circle id="amor_amor_nivel_uno_cb" class="cls-13" cx="290.81" cy="490.42" r="19.78"/>
      </g>
      <g id="amor_nivel_dos">
        <g id="aceptacion_amor">
          <circle id="aceptacion_amor_nivel_dos_ca" class="cls-15" cx="264.03" cy="619.24" r="66.61"/>
          <circle id="aceptacion_amor_nivel_dos_cb" class="cls-13" cx="264.03" cy="620.96" r="12.94"/>
        </g>
        <g id="compasion_amor">
          <circle id="compasion_amor_nivel_dos_ca" class="cls-15" cx="176.21" cy="589.32" r="66.61"/>
          <circle id="compasion_amor_nivel_dos_cb" class="cls-13" cx="176.21" cy="589.32" r="13.24"/>
        </g>
        <g id="interes_amor">
          <circle id="interes_amor_nivel_dos_ca" class="cls-15" cx="189.52" cy="537.23" r="66.61"/>
          <circle id="interes_amor_nivel_dos_cb" class="cls-13" cx="189.52" cy="537.23" r="14.12"/>
        </g>
        <g id="gratitud_amor">
          <circle id="gratitud_amor_nivel_dos_ca" class="cls-15" cx="146.26" cy="520.4" r="66.61"/>
          <circle id="gratitud_amor_nivel_dos_cb" class="cls-13" cx="141.84" cy="519.2" r="14.12"/>
        </g>
        <g id="solidaridad_amor">
          <circle id="solidaridad_amor_nivel_dos_ca" class="cls-15" cx="168.28" cy="487.74" r="66.61"/>
          <circle id="solidaridad_amor_nivel_dos_cb" class="cls-13" cx="168.28" cy="487.74" r="14.12"/>
        </g>
        <g id="cordialidad_amor">
          <circle id="cordialidad_amor_nivel_dos_ca" class="cls-15" cx="170.98" cy="448.81" r="66.61"/>
          <circle id="cordialidad_amor_nivel_dos_cb" class="cls-13" cx="170.98" cy="448.81" r="13.37"/>
        </g>
        <g id="simpatia_amor">
          <circle id="simpatia_amor_nivel_dos_ca" class="cls-15" cx="157.16" cy="409.45" r="66.61"/>
          <circle id="simpatia_amor_nivel_dos_cb" class="cls-13" cx="157.16" cy="409.45" r="13.37"/>
        </g>
        <g id="empatia_amor">
          <circle id="empatia_amor_nivel_dos_ca" class="cls-15" cx="210.25" cy="394.13" r="66.61"/>
          <circle id="empatia_amor_nivel_dos_cb" class="cls-13" cx="209.01" cy="392.49" r="13.52"/>
        </g>
        <g id="confianza_amor">
          <circle id="confianza_amor_nivel_dos_ca" class="cls-15" cx="245.09" cy="354.53" r="66.61"/>
          <circle id="confianza_amor_nivel_dos_cb" class="cls-13" cx="245.09" cy="357.69" r="13.39"/>
        </g>
        <g id="afecto_amor">
          <circle id="afecto_amor_nivel_dos_ca" class="cls-15" cx="310.59" cy="400.74" r="66.61"/>
          <circle id="afecto_amor_nivel_dos_cb" class="cls-13" cx="308.43" cy="397.69" r="13.22"/>
        </g>
        <g id="autoestima_amor">
          <circle id="autoestima_amor_nivel_dos_ca" class="cls-15" cx="306.68" cy="347.84" r="66.61"/>
          <circle id="autoestima_amor_nivel_dos_cb" class="cls-13" cx="280.78" cy="357.69" r="12.84"/>
        </g>
        <g id="amabilidad_amor">
          <circle id="amabilidad_amor_nivel_dos_ca" class="cls-15" cx="348.88" cy="407.14" r="66.61"/>
          <circle id="amabilidad_amor_nivel_dos_cb" class="cls-13" cx="348.88" cy="406.01" r="14.43"/>
        </g>
        <g id="carino_amor">
          <circle id="carino_amor_nivel_dos_ca" class="cls-15" cx="389" cy="421.14" r="66.61"/>
          <circle id="carino_amor_nivel_dos_cb" class="cls-13" cx="389" cy="421.14" r="14.43"/>
        </g>
        <g id="ternura_amor">
          <circle id="ternura_amor_nivel_dos_ca" class="cls-15" cx="399" cy="456.59" r="66.61"/>
          <circle id="ternura_amor_nivel_dos_cb" class="cls-13" cx="399.5" cy="458.88" r="13.13"/>
        </g>
        <g id="enamoramiento_amor">
          <circle id="enamoramiento_amor_nivel_dos_ca" class="cls-15" cx="437.25" cy="504.65" r="66.61"/>
          <circle id="enamoramiento_amor_nivel_dos_cb" class="cls-13" cx="437.25" cy="504.65" r="13.17"/>
        </g>
        <g id="admiracion_amor">
          <circle id="admiracion_amor_nivel_dos_ca" class="cls-15" cx="439.77" cy="536.09" r="66.61"/>
          <circle id="admiracion_amor_nivel_dos_cb" class="cls-13" cx="439.77" cy="536.09" r="13.95"/>
        </g>
        <g id="respeto_amor">
          <circle id="respeto_amor_nivel_dos_ca" class="cls-15" cx="386.59" cy="554.35" r="66.61"/>
          <circle id="respeto_amor_nivel_dos_cb" class="cls-13" cx="386.59" cy="554.35" r="12.91"/>
        </g>
        <g id="deseo_amor">
          <circle id="deseo_amor_nivel_dos_ca" class="cls-15" cx="337.63" cy="600.61" r="66.61"/>
          <circle id="deseo_amor_nivel_dos_cb" class="cls-13" cx="338.81" cy="603.29" r="13.52"/>
        </g>
      </g>
      <g id="amor_nivel_tres">
        <g id="afinidad_amor">
          <circle id="afinidad_amor_nivel_tres_ca" class="cls-15" cx="299.62" cy="677.56" r="26.14"/>
          <circle id="afinidad_amor_nivel_tres_cb" class="cls-13" cx="299.62" cy="673.35" r="5.46"/>
        </g>
        <g id="paciencia_amor">
          <circle id="paciencia_amor_nivel_tres_ca" class="cls-15" cx="215.93" cy="602.69" r="26.14"/>
          <circle id="paciencia_amor_nivel_tres_cb" class="cls-13" cx="215.93" cy="603.51" r="5.46"/>
        </g>
        <g id="perdon_amor">
          <circle id="perdon_amor_nivel_tres_ca" class="cls-15" cx="122.92" cy="576.25" r="26.14"/>
          <circle id="perdon_amor_nivel_tres_cb" class="cls-13" cx="127.72" cy="582.68" r="5.46"/>
        </g>
        <g id="curiosidad_amor">
          <circle id="curiosidad_amor_nivel_tres_ca" class="cls-15" cx="146.26" cy="550.04" r="26.14"/>
          <circle id="curiosidad_amor_nivel_tres_cb" class="cls-13" cx="133.18" cy="550.11" r="5.46"/>
        </g>
        <g id="agradecimiento_amor">
          <circle id="agradecimiento_amor_nivel_tres_cb" class="cls-15" cx="95.15" cy="551.67" r="26.14"/>
          <circle id="agradecimiento_amor_nivel_tres_ca" class="cls-13" cx="89.03" cy="538.78" r="5.46"/>
        </g>
        <g id="compartir_amor">
          <circle id="compartir_amor_nivel_tres_ca" class="cls-15" cx="117.46" cy="447.07" r="26.14"/>
          <circle id="compartir_amor_nivel_tres_cb" class="cls-13" cx="112.41" cy="432.78" r="5.46"/>
        </g>
        <g id="compenetracion_amor">
          <circle id="compenetracion_amor_nivel_tres_ca" class="cls-15" cx="214.34" cy="316.55" r="26.14"/>
          <circle id="compenetracion_amor_nivel_tres_cb" class="cls-13" cx="220.37" cy="322.07" r="5.46"/>
        </g>
        <g id="anhelo_amor">
          <circle id="anhelo_amor_nivel_tres_ca" class="cls-15" cx="377.14" cy="649.37" r="26.14"/>
          <circle id="anhelo_amor_nivel_tres_cb" class="cls-13" cx="377.14" cy="649.37" r="5.46"/>
        </g>
      </g>
      <g id="amor_nivel_cuatro">
        <g id="afiliacion_amor">
          <circle id="afiliacion_amor_nivel_cuatro_ca" class="cls-15" cx="260.12" cy="662.4" r="17.42"/>
          <circle id="afiliacion_amor_nivel_cuatro_cb" class="cls-13" cx="261.54" cy="661.52" r="5.41"/>
        </g>
        <g id="autoaceptacion_amor">
          <circle id="autoaceptacion_amor_nivel_cuatro_ca" class="cls-15" cx="249.56" cy="585.36" r="17.42"/>
          <circle id="autoaceptacion_amor_nivel_cuatro_cb" class="cls-13" cx="249.56" cy="586.12" r="5.41"/>
        </g>
        <g id="agape_amor">
          <circle id="agape_amor_nivel_cuatro_ca" class="cls-15" cx="94.88" cy="455.58" r="17.42"/>
          <circle id="agape_amor_nivel_cuatro_cb" class="cls-13" cx="93.31" cy="459.09" r="5.41"/>
        </g>
        <g id="invulnerabilidad_amor">
          <circle id="invulnerabilidad_amor_nivel_cuatro_ca" class="cls-15" cx="132.41" cy="369.19" r="17.42"/>
          <circle id="invulnerabilidad_amor_nivel_cuatro_cb" class="cls-13" cx="130.84" cy="372.7" r="5.41"/>
        </g>
        <g id="sensibilidad_amor">
          <circle id="sensibilidad_amor_nivel_cuatro_ca" class="cls-15" cx="168.24" cy="354.53" r="17.42"/>
          <circle id="sensibilidad_amor_nivel_cuatro_cb" class="cls-13" cx="168.24" cy="354.53" r="5.41"/>
        </g>
        <g id="autoconfianza_amor">
          <circle id="autoconfianza_amor_nivel_cuatro_ca" class="cls-15" cx="258.47" cy="325.31" r="17.42"/>
          <circle id="autoconfianza_amor_nivel_cuatro_cb" class="cls-13" cx="257.97" cy="325" r="5.41"/>
        </g>
        <g id="vinculo_amor">
          <circle id="vinculo_amor_nivel_cuatro_ca" class="cls-15" cx="320.11" cy="307.89" r="17.42"/>
          <circle id="vinculo_amor_nivel_cuatro_cb" class="cls-13" cx="320.82" cy="308.4" r="5.41"/>
        </g>
        <g id="apego_amor">
          <circle id="apego_amor_nivel_cuatro_ca" class="cls-15" cx="373.97" cy="355.08" r="17.42"/>
          <circle id="apego_amor_nivel_cuatro_cb" class="cls-13" cx="372.39" cy="358.59" r="5.41"/>
        </g>
        <g id="atraccion_amor">
          <circle id="atraccion_amor_nivel_cuatro_ca" class="cls-15" cx="409.1" cy="509.52" r="17.42"/>
          <circle id="atraccion_amor_nivel_cuatro_cb" class="cls-13" cx="409.1" cy="513.42" r="5.41"/>
        </g>
        <g id="fervor_amor">
          <circle id="fervor_amor_nivel_cuatro_ca" class="cls-15" cx="381.53" cy="524.6" r="17.42"/>
          <circle id="fervor_amor_nivel_cuatro_cb" class="cls-13" cx="383.69" cy="528.65" r="5.41"/>
        </g>
        <g id="veneracion_amor">
          <circle id="veneracion_amor_nivel_cuatro_ca" class="cls-15" cx="356.79" cy="558.63" r="17.42"/>
          <circle id="veneracion_amor_nivel_cuatro_cb" class="cls-13" cx="362.78" cy="558.63" r="5.41"/>
        </g>
        <g id="fascinacion_amor">
          <circle id="fascinacion_amor_nivel_cuatro_ca" class="cls-15" cx="479" cy="552.34" r="17.42"/>
          <circle id="fascinacion_amor_nivel_cuatro_cb" class="cls-13" cx="479.7" cy="550.04" r="5.41"/>
        </g>
        <g id="adoracion_amor">
          <circle id="adoracion_amor_nivel_cuatro_ca" class="cls-15" cx="440.43" cy="579" r="17.42"/>
          <circle id="adoracion_amor_nivel_cuatro_cb" class="cls-13" cx="439.77" cy="577.49" r="5.41"/>
        </g>
        <g id="devocion_amor">
          <circle id="devocion_amor_nivel_cuatro_ca" class="cls-15" cx="394.1" cy="584.99" r="17.42"/>
          <circle id="devocion_amor_nivel_cuatro_cb" class="cls-13" cx="392.86" cy="582.9" r="5.41"/>
        </g>
        <g id="capricho_amor">
          <circle id="capricho_amor_nivel_cuatro_ca" class="cls-15" cx="380.2" cy="610.11" r="17.42"/>
          <circle id="capricho_amor_nivel_cuatro_cb" class="cls-13" cx="379.66" cy="614.22" r="5.41"/>
        </g>
        <g id="afan_amor">
          <circle id="afan_amor_nivel_cuatro_ca" class="cls-15" cx="399.68" cy="632.02" r="17.42"/>
          <circle id="afan_amor_nivel_cuatro_cb" class="cls-13" cx="398.1" cy="635.52" r="5.41"/>
        </g>
        <g id="antojo_amor">
          <circle id="antojo_amor_nivel_cuatro_ca" class="cls-15" cx="346.92" cy="638.38" r="17.42"/>
          <circle id="antojo_amor_nivel_cuatro_cb" class="cls-13" cx="346.92" cy="638.38" r="5.41"/>
        </g>
      </g>
      <g id="amor_nivel_cinco">
        <g id="piedad_amor">
          <circle id="piedad_amor_nivel_cinco_ca" class="cls-13" cx="152.47" cy="622.88" r="10.6"/>
          <circle id="piedad_amor_nivel_cinco_cb" class="cls-13" cx="152.2" cy="623.95" r="2"/>
        </g>
        <g id="misericordia_amor">
          <circle id="misericordia_amor_nivel_cinco_ca" class="cls-13" cx="196.39" cy="622.88" r="10.6"/>
          <circle id="misericordia_amor_nivel_cinco_cb" class="cls-13" cx="196.39" cy="621.24" r="2"/>
        </g>
        <g id="reconocimiento_amor">
          <circle id="reconocimiento_amor_nivel_cinco_ca" class="cls-13" cx="305.76" cy="633.9" r="10.6"/>
          <circle id="reconocimiento_amor_nivel_cinco_cb" class="cls-13" cx="305.76" cy="633.9" r="2"/>
        </g>
        <g id="querer_amor">
          <circle id="querer_amor_nivel_cinco_ca" class="cls-13" cx="302.5" cy="591.53" r="10.6"/>
          <circle id="querer_amor_nivel_cinco_cb" class="cls-13" cx="302.5" cy="591.53" r="2"/>
        </g>
        <g id="embeleso_amor">
          <circle id="embeleso_amor_nivel_cinco_ca" class="cls-13" cx="442.52" cy="474.83" r="10.6"/>
          <circle id="embeleso_amor_nivel_cinco_cb" class="cls-13" cx="442.59" cy="474.83" r="2"/>
        </g>
        <g id="estima_amor">
          <circle id="estima_amor_nivel_cinco_ca" class="cls-13" cx="318.77" cy="416.45" r="10.6"/>
          <circle id="estima_amor_nivel_cinco_cb" class="cls-13" cx="320.39" cy="416.45" r="2"/>
        </g>
        <g id="pundonor_amor">
          <circle id="pundonor_amor_nivel_cinco_ca" class="cls-13" cx="240.08" cy="395.69" r="10.6"/>
          <circle id="pundonor_amor_nivel_cinco_cb" class="cls-13" cx="240.08" cy="395.69" r="2"/>
        </g>
        <g id="caridad_amor">
          <circle id="caridad_amor_nivel_cinco_ca" class="cls-13" cx="143.8" cy="466.12" r="10.6"/>
          <circle id="caridad_amor_nivel_cinco_cb" class="cls-13" cx="143.8" cy="463.74" r="2"/>
        </g>
        <g id="altruismo_amor">
          <circle id="altruismo_amor_nivel_cinco_ca" class="cls-13" cx="116.76" cy="494.15" r="10.6"/>
          <circle id="altruismo_amor_nivel_cinco_cb" class="cls-13" cx="117.25" cy="494.15" r="2"/>
        </g>
        <g id="filantropia_amor">
          <circle id="filantropia_amor_nivel_cinco_ca" class="cls-13" cx="87.8" cy="501.86" r="10.6"/>
          <circle id="filantropia_amor_nivel_cinco_cb" class="cls-13" cx="87.8" cy="501.86" r="2"/>
        </g>
        <g id="prosocialidad_amor">
          <circle id="prosocialidad_amor_nivel_cinco_ca" class="cls-13" cx="191.82" cy="470.19" r="10.6"/>
          <circle id="prosocialidad_amor_nivel_cinco_cb" class="cls-13" cx="191.82" cy="466.12" r="2"/>
        </g>
        <g id="aprecio_amor">
          <circle id="aprecio_amor_nivel_cinco_ca" class="cls-13" cx="330.87" cy="332.82" r="10.6"/>
          <circle id="aprecio_amor_nivel_cinco_cb" class="cls-13" cx="330.87" cy="334.13" r="2.95"/>
        </g>
        <g id="arrobo_amor">
          <circle id="arrobo_amor_nivel_cinco_ca" class="cls-13" cx="471.68" cy="461.73" r="10.6"/>
          <circle id="arrobo_amor_nivel_cinco_cb" class="cls-13" cx="471.68" cy="463.28" r="2"/>
        </g>
        <g id="calidez_amor">
          <circle id="calidez_amor_nivel_cinco_ca" class="cls-13" cx="426.2" cy="426.24" r="10.6"/>
          <circle id="calidez_amor_nivel_cinco_cb" class="cls-13" cx="426.11" cy="425.64" r="2"/>
        </g>
        <g id="predileccion_amor">
          <circle id="predileccion_amor_nivel_cinco_ca" class="cls-13" cx="236.42" cy="633.9" r="10.6"/>
          <circle id="predileccion_amor_nivel_cinco_cb" class="cls-13" cx="236.42" cy="633.9" r="2"/>
        </g>
      </g>
      <g id="amor_lineas">
        <line class="cls-13" x1="274.72" y1="445.25" x2="284.24" y2="473.91"/>
        <line class="cls-13" x1="248.79" y1="367.18" x2="269.85" y2="430.57"/>
        <line class="cls-13" x1="280.78" y1="368.68" x2="287.24" y2="473.91"/>
        <line class="cls-13" x1="306.68" y1="407.02" x2="294.15" y2="473.91"/>
        <line class="cls-13" x1="345.82" y1="414.44" x2="300.42" y2="476.06"/>
        <line class="cls-13" x1="377.2" y1="427.26" x2="305.27" y2="478.63"/>
        <line class="cls-13" x1="388.16" y1="462.02" x2="306.68" y2="485.96"/>
        <line class="cls-13" x1="304.51" y1="500.78" x2="378.28" y2="551.3"/>
        <line class="cls-13" x1="319.99" y1="561.57" x2="334.21" y2="593.17"/>
        <line class="cls-13" x1="296.48" y1="507.26" x2="315.27" y2="550.04"/>
        <line class="cls-13" x1="294.85" y1="503.56" x2="297" y2="508.45"/>
        <line class="cls-13" x1="271.89" y1="580.07" x2="266.51" y2="608.31"/>
        <line class="cls-13" x1="286.24" y1="504.75" x2="274.21" y2="567.94"/>
        <line class="cls-13" x1="277.98" y1="500.36" x2="182.4" y2="584.99"/>
        <line class="cls-13" x1="275.43" y1="496.16" x2="199.58" y2="530.38"/>
        <line class="cls-13" x1="241.71" y1="499.13" x2="155.96" y2="515.91"/>
        <line class="cls-13" x1="273.82" y1="492.85" x2="263.77" y2="494.82"/>
        <line class="cls-13" x1="228.81" y1="469.95" x2="182.3" y2="455.1"/>
        <line class="cls-13" x1="272.62" y1="483.94" x2="238.32" y2="472.99"/>
        <line class="cls-13" x1="276.38" y1="479.33" x2="224.96" y2="449.89"/>
        <line class="cls-13" x1="205.53" y1="437.28" x2="168.28" y2="415.75"/>
        <line class="cls-13" x1="241.76" y1="431.13" x2="216.94" y2="401.85"/>
        <line class="cls-13" x1="279.83" y1="476.06" x2="260.25" y2="452.95"/>
        <line class="cls-13" x1="279.17" y1="355.55" x2="259.73" y2="326.39"/>
        <line class="cls-13" x1="257.57" y1="326.39" x2="248.39" y2="351.56"/>
        <line class="cls-13" x1="217.17" y1="319.59" x2="242" y2="353.3"/>
        <line class="cls-13" x1="318.38" y1="392.49" x2="370.64" y2="361.3"/>
        <line class="cls-13" x1="368.28" y1="355.08" x2="321.8" y2="311.72"/>
        <line class="cls-13" x1="413.67" y1="512.42" x2="429.35" y2="508.08"/>
        <line class="cls-13" x1="306.68" y1="490.76" x2="429.35" y2="506.12"/>
        <line class="cls-13" x1="384.63" y1="545.49" x2="383.69" y2="530.42"/>
        <line class="cls-13" x1="388" y1="564.25" x2="393.99" y2="587.2"/>
        <line class="cls-13" x1="395.59" y1="559.44" x2="438.74" y2="577.49"/>
        <line class="cls-13" x1="449.8" y1="538.62" x2="475.64" y2="550.04"/>
        <line class="cls-13" x1="349.28" y1="606.82" x2="376.28" y2="613.4"/>
        <line class="cls-13" x1="398.1" y1="635.52" x2="345.44" y2="608.63"/>
        <line class="cls-13" x1="374.72" y1="646.34" x2="345.44" y2="610.39"/>
        <line class="cls-13" x1="346.77" y1="635.08" x2="341.17" y2="614.22"/>
        <line class="cls-13" x1="282.25" y1="648.15" x2="297.62" y2="669.77"/>
        <line class="cls-13" x1="269.2" y1="629.79" x2="274.93" y2="637.85"/>
        <line class="cls-13" x1="261.54" y1="662.4" x2="296.36" y2="672.77"/>
        <line class="cls-13" x1="263.06" y1="626.72" x2="260.12" y2="662.4"/>
        <line class="cls-13" x1="260.12" y1="611.24" x2="251.08" y2="589.32"/>
        <line class="cls-13" x1="180.97" y1="537.23" x2="136.04" y2="550.6"/>
        <line class="cls-13" x1="131.84" y1="521.6" x2="93.52" y2="535.67"/>
        <line class="cls-13" x1="95.32" y1="455.1" x2="112.31" y2="434.66"/>
        <line class="cls-13" x1="163.79" y1="452.95" x2="91.32" y2="459.09"/>
        <line class="cls-13" x1="116.09" y1="433.66" x2="162.27" y2="448.81"/>
        <line class="cls-13" x1="168.59" y1="442.47" x2="159.7" y2="419.64"/>
        <line class="cls-13" x1="204.03" y1="394.13" x2="164.06" y2="406.01"/>
      </g>
    </g>
    <g id="alegria">
      <g id="alegria_nivel_uno">
        <circle id="alegria_alegria_nivel_dos_ca" class="cls-17" cx="816.2" cy="491" r="180.72"/>
        <circle id="alegria_alegria_nivel_dos_cb" class="cls-13" cx="816.6" cy="491.4" r="20.24"/>
      </g>
      <g id="alegria_nivel_dos">
        <g id="ilusion_alegria">
          <circle id="ilusion_alegria_nivel_dos_ca" class="cls-17" cx="832.14" cy="582.9" r="67.3"/>
          <circle id="ilusion_alegria_nivel_dos_cb" class="cls-16" cx="830.83" cy="582.9" r="13.49"/>
        </g>
        <g id="placer_alegria">
          <circle id="placer_alegria_nivel_dos_ca" class="cls-17" cx="752.34" cy="570.4" r="67.3"/>
          <circle id="placer_alegria_nivel_dos_cb" class="cls-16" cx="751.35" cy="569.41" r="13.49"/>
        </g>
        <g id="humor_alegria">
          <circle id="humor_alegria_nivel_dos_ca" class="cls-17" cx="669.57" cy="503.1" r="67.3"/>
          <circle id="humor_alegria_nivel_dos_cb" class="cls-16" cx="669.57" cy="505.71" r="13.49"/>
        </g>
        <g id="diversion_alegria">
          <circle id="diversion_alegria_nivel_dos_ca" class="cls-17" cx="671.73" cy="424.91" r="67.3"/>
          <circle id="diversion_alegria_nivel_dos_cb" class="cls-16" cx="671.73" cy="427.52" r="13.49"/>
        </g>
        <g id="contento_alegria">
          <circle id="contento_alegria_nivel_dos_ca" class="cls-17" cx="744.39" cy="401.06" r="67.3"/>
          <circle id="contento_alegria_nivel_dos_cb" class="cls-16" cx="743.08" cy="401.06" r="13.49"/>
        </g>
        <g id="euforia_alegria">
          <circle id="euforia_alegria_nivel_dos_ca" class="cls-17" cx="898.47" cy="367.61" r="67.3"/>
          <circle id="euforia_alegria_nivel_dos_cb" class="cls-16" cx="897.16" cy="367.61" r="13.49"/>
        </g>
        <g id="entusiasmo_alegria">
          <circle id="entusiasmo_alegria_nivel_dos_ca" class="cls-17" cx="934.15" cy="391.38" r="67.3"/>
          <circle id="entusiasmo_alegria_nivel_dos_cb" class="cls-16" cx="932.83" cy="391.38" r="13.49"/>
        </g>
        <g id="optimismo_alegria">
          <circle id="optimismo_alegria_nivel_dos_ca" class="cls-17" cx="939.06" cy="438.41" r="67.3"/>
          <circle id="optimismo_alegria_nivel_dos_cb" class="cls-16" cx="937.74" cy="438.41" r="13.49"/>
        </g>
        <g id="jubilo_alegria">
          <circle id="jubilo_alegria_nivel_dos_ca" class="cls-17" cx="881.1" cy="542.09" r="67.3"/>
          <circle id="jubilo_alegria_nivel_dos_cb" class="cls-16" cx="879.78" cy="542.09" r="13.49"/>
        </g>
      </g>
      <g id="alegria_nivel_tres">
        <g>
          <circle id="Alegria_Nivel_03_-_CA" data-name="Alegria Nivel 03 - CA" class="cls-17" cx="750.28" cy="631.48" r="25.52"/>
          <circle id="Alegria_Nivel_03_-_CB" data-name="Alegria Nivel 03 - CB" class="cls-16" cx="749.41" cy="633.49" r="6.79"/>
        </g>
        <g>
          <circle id="Alegria_Nivel_03_-_CA-2" data-name="Alegria Nivel 03 - CA" class="cls-17" cx="778.85" cy="612.18" r="25.52"/>
          <circle id="Alegria_Nivel_03_-_CB-2" data-name="Alegria Nivel 03 - CB" class="cls-16" cx="778.85" cy="613.47" r="6.79"/>
        </g>
        <g>
          <circle id="Alegria_Nivel_03_-_CA-3" data-name="Alegria Nivel 03 - CA" class="cls-17" cx="748.43" cy="526.64" r="25.52"/>
          <circle id="Alegria_Nivel_03_-_CB-3" data-name="Alegria Nivel 03 - CB" class="cls-16" cx="748.43" cy="526.07" r="6.79"/>
        </g>
        <g>
          <circle id="Alegria_Nivel_03_-_CA-4" data-name="Alegria Nivel 03 - CA" class="cls-17" cx="613.01" cy="432.62" r="25.52"/>
          <circle id="Alegria_Nivel_03_-_CB-4" data-name="Alegria Nivel 03 - CB" class="cls-16" cx="613.01" cy="432.05" r="6.79"/>
        </g>
        <g>
          <circle id="Alegria_Nivel_03_-_CA-5" data-name="Alegria Nivel 03 - CA" class="cls-17" cx="777.87" cy="349.6" r="25.52"/>
          <circle id="Alegria_Nivel_03_-_CB-5" data-name="Alegria Nivel 03 - CB" class="cls-16" cx="777.87" cy="349.03" r="6.79"/>
        </g>
        <g>
          <circle id="Alegria_Nivel_03_-_CA-6" data-name="Alegria Nivel 03 - CA" class="cls-17" cx="823.62" cy="389.03" r="25.52"/>
          <circle id="Alegria_Nivel_03_-_CB-6" data-name="Alegria Nivel 03 - CB" class="cls-16" cx="823.62" cy="388.46" r="6.79"/>
        </g>
        <g>
          <circle id="Alegria_Nivel_03_-_CA-7" data-name="Alegria Nivel 03 - CA" class="cls-17" cx="924.25" cy="534.31" r="25.52"/>
          <circle id="Alegria_Nivel_03_-_CB-7" data-name="Alegria Nivel 03 - CB" class="cls-16" cx="924.25" cy="534.31" r="6.79"/>
        </g>
        <g>
          <circle id="Alegria_Nivel_03_-_CA-8" data-name="Alegria Nivel 03 - CA" class="cls-17" cx="931.04" cy="642.25" r="25.52"/>
          <circle id="Alegria_Nivel_03_-_CB-8" data-name="Alegria Nivel 03 - CB" class="cls-16" cx="931.04" cy="642.25" r="6.79"/>
        </g>
        <g>
          <circle id="Alegria_Nivel_03_-_CA-9" data-name="Alegria Nivel 03 - CA" class="cls-17" cx="710.57" cy="596.39" r="25.52"/>
          <circle id="Alegria_Nivel_03_-_CB-9" data-name="Alegria Nivel 03 - CB" class="cls-16" cx="709.7" cy="598.4" r="6.79"/>
        </g>
      </g>
      <g id="alegria_nivel_cuatro">
        <g id="distension_alegria">
          <circle id="distension_alegria_nivel_cuatro_ca" class="cls-17" cx="622.39" cy="519.99" r="17.96"/>
          <circle id="distension_alegria_nivel_cuatro_cb" class="cls-16" cx="622.39" cy="519.29" r="4.85"/>
        </g>
        <g id="desenfocado_alegria">
          <circle id="desenfocado_alegria_nivel_cuatro_ca" class="cls-17" cx="612.44" cy="492.21" r="17.96"/>
          <circle id="desenfocado_alegria_nivel_cuatro_cb" class="cls-16" cx="612.44" cy="491.51" r="4.85"/>
        </g>
        <g id="congratulacion_alegria">
          <circle id="congratulacion_alegria_nivel_cuatro_ca" class="cls-17" cx="721.06" cy="465.16" r="17.96"/>
          <circle id="congratulacion_alegria_nivel_cuatro_cb" class="cls-16" cx="721.06" cy="464.46" r="4.85"/>
        </g>
        <g id="chevere_alegria">
          <circle id="chevere_alegria_nivel_cuatro_ca" class="cls-17" cx="927.03" cy="479.4" r="17.96"/>
          <circle id="chevere_alegria_nivel_cuatro_cb" class="cls-16" cx="927.03" cy="478.7" r="4.85"/>
        </g>
        <g id="moral_alta_alegria">
          <circle id="moral_alta_alegria_nivel_cuatro_tx" class="cls-17" cx="978.96" cy="505.71" r="17.96"/>
          <circle id="moral_alta_alegria_nivel_cuatro_cb" class="cls-16" cx="978.96" cy="505.01" r="4.85"/>
        </g>
        <g id="schadenfreude_alegria">
          <circle id="schadenfreude_alegria_nivel_cuatro_ca" class="cls-17" cx="956.44" cy="586.06" r="17.96"/>
          <circle id="schadenfreude_alegria_nivel_cuatro_cb" class="cls-16" cx="956.44" cy="585.36" r="4.85"/>
        </g>
        <g id="alborozo_alegria">
          <circle id="alborozo_alegria_nivel_cuatro_ca" class="cls-17" cx="916.7" cy="573.55" r="17.96"/>
          <circle id="alborozo_alegria_nivel_cuatro_cb" class="cls-16" cx="916.7" cy="572.85" r="4.85"/>
        </g>
        <g id="algazara_alegria">
          <circle id="algazara_alegria_nivel_cuatro_ca" class="cls-17" cx="877.1" cy="580.03" r="17.96"/>
          <circle id="algazara_alegria_nivel_cuatro_cb" class="cls-16" cx="877.1" cy="579.33" r="4.85"/>
        </g>
        <g id="expectacion_alegria">
          <circle id="expectacion_alegria_nivel_cuatro_ca" class="cls-17" cx="834.56" cy="647.36" r="17.96"/>
          <circle id="expectacion_alegria_nivel_cuatro_cb" class="cls-16" cx="834.56" cy="646.66" r="4.85"/>
        </g>
      </g>
      <g id="alegria_nivel_cinco">
        <g id="encanto_alegria">
          <circle id="encanto_alegria_nivel_cinco_ca" class="cls-17" cx="793" cy="631.92" r="7.24"/>
          <circle id="encanto_alegria_nivel_cinco_cb" class="cls-16" cx="793" cy="629.84" r="3.13"/>
        </g>
        <g id="complacencia_alegria">
          <circle id="complacencia_alegria_nivel_cinco_ca" class="cls-17" cx="787" cy="399.62" r="7.24"/>
          <circle id="complacencia_alegria_nivel_cinco_cb" class="cls-16" cx="787" cy="397.2" r="3.13"/>
        </g>
        <g id="frenesi_alegria">
          <circle id="frenesi_alegria_nivel_cinco_ca" class="cls-17" cx="882.28" cy="324.39" r="7.24"/>
          <circle id="frenesi_alegria_nivel_cinco_cb" class="cls-16" cx="882.28" cy="322.53" r="3.13"/>
        </g>
        <g id="exito_alegria">
          <circle id="exito_alegria_nivel_cinco_ca" class="cls-17" cx="928.26" cy="340.23" r="7.24"/>
          <circle id="exito_alegria_nivel_cinco_cb" class="cls-16" cx="928.26" cy="338.13" r="3.13"/>
        </g>
        <g id="elacion_alegria">
          <circle id="elacion_alegria_nivel_cinco_ca" class="cls-17" cx="975.96" cy="360.96" r="7.24"/>
          <circle id="elacion_alegria_nivel_cinco_cb" class="cls-16" cx="975.96" cy="358.36" r="3.13"/>
        </g>
        <g id="ganas_alegria">
          <circle id="ganas_alegria_nivel_cinco_ca" class="cls-17" cx="977.26" cy="461.23" r="7.24"/>
          <circle id="ganas_alegria_nivel_cinco_cb" class="cls-16" cx="977.26" cy="459.1" r="3.13"/>
        </g>
        <g id="animo_alegria">
          <circle id="animo_alegria_nivel_cinco_ca" class="cls-17" cx="956.72" cy="494.13" r="7.24"/>
          <circle id="animo_alegria_nivel_cinco_cb" class="cls-16" cx="956.72" cy="491" r="3.13"/>
        </g>
        <g id="regodeo_alegria">
          <circle id="regodeo_alegria_nivel_cinco_ca" class="cls-17" cx="968.18" cy="553.73" r="7.24"/>
          <circle id="regodeo_alegria_nivel_cinco_cb" class="cls-16" cx="968.18" cy="551.02" r="3.13"/>
        </g>
        <g id="consuelo_alegria">
          <circle id="consuelo_alegria_nivel_cinco_ca" class="cls-17" cx="931.79" cy="604.3" r="7.24"/>
          <circle id="consuelo_alegria_nivel_cinco_cb" class="cls-16" cx="931.79" cy="601.69" r="3.13"/>
        </g>
      </g>
      <g id="alegria_lineas">
        <line class="cls-13" x1="750.32" y1="409.96" x2="805.4" y2="477.72"/>
        <line class="cls-13" x1="890.72" y1="377.89" x2="823.62" y2="480.99"/>
        <line class="cls-13" x1="924.25" y1="400.34" x2="827.36" y2="482.09"/>
        <line class="cls-13" x1="929.6" y1="441.21" x2="830.4" y2="485.37"/>
        <line class="cls-13" x1="870.68" y1="535.88" x2="825.56" y2="498.68"/>
        <line class="cls-13" x1="829" y1="572.85" x2="818.6" y2="508.79"/>
        <line class="cls-13" x1="758.36" y1="561.03" x2="806.84" y2="503.1"/>
        <line class="cls-13" x1="681.32" y1="504.2" x2="798.44" y2="493.4"/>
        <line class="cls-13" x1="736.09" y1="414.03" x2="722.6" y2="461.28"/>
        <line class="cls-13" x1="780.56" y1="354.12" x2="817.07" y2="386.17"/>
        <line class="cls-13" x1="817.07" y1="474.79" x2="821.6" y2="389.03"/>
        <line class="cls-13" x1="888.2" y1="369.39" x2="827.18" y2="388.22"/>
        <line class="cls-13" x1="919.34" y1="535.88" x2="888.2" y2="543.2"/>
        <line class="cls-13" x1="930.2" y1="640.28" x2="883.4" y2="552.16"/>
        <line class="cls-13" x1="877.1" y1="574.48" x2="878.84" y2="551.02"/>
        <line class="cls-13" x1="834.16" y1="531.11" x2="823.8" y2="508.32"/>
        <line class="cls-13" x1="923.44" y1="727.41" x2="843.95" y2="552.63"/>
        <line class="cls-13" x1="834.56" y1="646.66" x2="829" y2="593.66"/>
        <line class="cls-13" x1="778.85" y1="612.18" x2="756.2" y2="578.76"/>
        <line class="cls-13" x1="749.41" y1="631.48" x2="750.28" y2="580.03"/>
        <line class="cls-13" x1="714.44" y1="595.32" x2="744.92" y2="572.85"/>
        <line class="cls-13" x1="678.2" y1="513.44" x2="741.64" y2="562.75"/>
        <line class="cls-13" x1="748.43" y1="530.99" x2="750.28" y2="557.72"/>
        <line class="cls-13" x1="624.68" y1="519.99" x2="660.32" y2="506.65"/>
        <line class="cls-13" x1="617.29" y1="491.51" x2="658.76" y2="503.1"/>
        <line class="cls-13" x1="671.73" y1="438.84" x2="669.57" y2="498.68"/>
        <line class="cls-13" x1="923.75" y1="727.57" x2="836.84" y2="591.61"/>
        <line class="cls-13" x1="922.18" y1="537.95" x2="916.7" y2="569.51"/>
      </g>
    </g>
    <g id="emociones_sociales_y_morales">
      <g id="emociones_sociales_y_morales_nivel_uno">
        <circle id="emociones_sociales_y_morales_emociones_sociales_y_morales_nivel_uno_ca" class="cls-7" cx="555.41" cy="725.07" r="161.42"/>
        <circle id="emociones_sociales_y_morales_emociones_sociales_y_morales_nivel_uno_tx" class="cls-13" cx="556.89" cy="726.55" r="17.15"/>
      </g>
      <g id="emociones_sociales_y_morales_nivel_dos">
        <g id="timidez_emociones_sociales_y_morales">
          <circle id="timidez_emociones_sociales_y_morales_nivel_dos_ca" class="cls-7" cx="443.13" cy="700.21" r="66.39"/>
          <circle id="timidez_emociones_sociales_y_morales_nivel_dos_cb" class="cls-13" cx="441.24" cy="699.16" r="13.68"/>
        </g>
        <g id="emociones_laudatorias_emociones_sociales_y_morales">
          <circle id="emociones_laudatorias_emociones_sociales_y_morales_nivel_dos_ca" class="cls-7" cx="530.4" cy="626.72" r="66.39"/>
          <circle id="emociones_laudatorias_emociones_sociales_y_morales_nivel_dos_cb" class="cls-13" cx="528.51" cy="625.67" r="13.68"/>
        </g>
        <g id="emociones_condenatorias_emociones_sociales_y_morales">
          <circle id="emociones_condenatorias_emociones_sociales_y_morales_nivel_dos_ca" class="cls-7" cx="514.01" cy="813.75" r="66.39"/>
          <circle id="emociones_condenatorias_emociones_sociales_y_morales_nivel_dos_cb" class="cls-13" cx="512.12" cy="812.7" r="13.68"/>
        </g>
        <g id="verguenza_emociones_sociales_y_morales">
          <circle id="verguenza_emociones_sociales_y_morales_nivel_dos_ca" class="cls-7" cx="642.41" cy="680.26" r="66.39"/>
          <circle id="verguenza_emociones_sociales_y_morales_nivel_dos_cb" class="cls-13" cx="640.52" cy="679.22" r="13.68"/>
        </g>
        <g id="culpa_emociones_sociales_y_morales">
          <circle id="culpa_emociones_sociales_y_morales_nivel_dos_ca" class="cls-7" cx="654.2" cy="795.08" r="66.39"/>
          <circle id="culpa_emociones_sociales_y_morales_nivel_dos_cb" class="cls-13" cx="652.3" cy="794.03" r="13.68"/>
        </g>
      </g>
      <g id="emociones_sociales_y_morales_nivel_tres">
        <g id="desprecio_emociones_sociales_y_morales">
          <circle id="desprecio_emociones_sociales_y_morales_nivel_tres_ca" class="cls-7" cx="562.02" cy="822.38" r="25.79"/>
          <circle id="desprecio_emociones_sociales_y_morales_nivel_tres_cb" class="cls-13" cx="562.02" cy="822.38" r="6.74"/>
        </g>
        <g id="asco_moral_emociones_sociales_y_morales">
          <circle id="asco_moral_emociones_sociales_y_morales_nivel_tres_ca" class="cls-7" cx="545.02" cy="853.39" r="25.79"/>
          <circle id="asco_moral_emociones_sociales_y_morales_nivel_tres_cb" class="cls-13" cx="545.02" cy="853.39" r="6.74"/>
        </g>
        <g id="rubor_emociones_sociales_y_morales">
          <circle id="rubor_emociones_sociales_y_morales_nivel_tres_ca" class="cls-7" cx="427.56" cy="652.12" r="25.79"/>
          <circle id="rubor_emociones_sociales_y_morales_nivel_tres_cb" class="cls-13" cx="427.56" cy="652.22" r="6.74"/>
        </g>
        <g id="gratitud_emociones_sociales_y_morales">
          <circle id="gratitud_emociones_sociales_y_morales_nivel_tres_ca" class="cls-7" cx="556.89" cy="574.48" r="25.79"/>
          <circle id="gratitud_emociones_sociales_y_morales_nivel_tres_cb" class="cls-13" cx="558.31" cy="575.37" r="6.74"/>
          <g id="gratitud_emociones_sociales_y_morales_nivel_tres_tx">
            <text class="cls-29" transform="translate(543.5 564.32)"><tspan x="0" y="0">Gr</tspan><tspan class="cls-67" x="9.89" y="0">a</tspan><tspan x="14.94" y="0">titud</tspan></text>
          </g>
        </g>
        <g id="orgullo_emociones_sociales_y_morales">
          <circle id="orgullo_emociones_sociales_y_morales_nivel_tres_ca" class="cls-7" cx="582.83" cy="597.4" r="25.79"/>
          <circle id="orgullo_emociones_sociales_y_morales_nivel_tres_cb" class="cls-13" cx="584.27" cy="597.4" r="6.74"/>
        </g>
        <g id="verguenza_ajena_emociones_sociales_y_morales">
          <circle id="verguenza_ajena_emociones_sociales_y_morales_nivel_tres_ca" class="cls-7" cx="624.01" cy="633.82" r="25.79"/>
          <circle id="verguenza_ajena_emociones_sociales_y_morales_nivel_tres_cb" class="cls-13" cx="622.79" cy="634.93" r="6.74"/>
        </g>
        <g id="embarazo_emociones_sociales_y_morales">
          <circle id="embarazo_emociones_sociales_y_morales_nivel_tres_ca" class="cls-7" cx="660.77" cy="633.82" r="25.79"/>
          <circle id="embarazo_emociones_sociales_y_morales_nivel_tres_cb" class="cls-13" cx="658.64" cy="633.97" r="6.74"/>
        </g>
      </g>
      <g id="emociones_sociales_y_morales_nivel_cuatro">
        <g id="elevacion_emociones_sociales_y_morales">
          <circle id="elevacion_emociones_sociales_y_morales_nivel_cuatro_ca" class="cls-7" cx="487.68" cy="603.93" r="18.15"/>
          <circle id="elevacion_emociones_sociales_y_morales_nivel_cuatro_cb" class="cls-13" cx="490.4" cy="605.19" r="5.76"/>
        </g>
        <g id="indignacion_emociones_sociales_y_morales">
          <circle id="indignacion_emociones_sociales_y_morales_nivel_cuatro_ca" class="cls-7" cx="495.52" cy="855.76" r="18.15"/>
          <circle id="indignacion_emociones_sociales_y_morales_nivel_cuatro_cb" class="cls-13" cx="495.52" cy="850.25" r="5.76"/>
        </g>
        <g id="aversion_emociones_sociales_y_morales">
          <circle id="aversion_emociones_sociales_y_morales_nivel_cuatro_ca" class="cls-7" cx="471.65" cy="825.61" r="18.15"/>
          <circle id="aversion_emociones_sociales_y_morales_nivel_cuatro_cb" class="cls-13" cx="470.77" cy="825.51" r="5.76"/>
        </g>
        <g id="cohibicion_emociones_sociales_y_morales">
          <circle id="cohibicion_emociones_sociales_y_morales_nivel_cuatro_ca" class="cls-7" cx="427.56" cy="749.54" r="18.15"/>
          <circle id="cohibicion_emociones_sociales_y_morales_nivel_cuatro_cb" class="cls-13" cx="426.58" cy="749.47" r="5.76"/>
        </g>
        <g id="ridiculo_emociones_sociales_y_morales">
          <circle id="ridiculo_emociones_sociales_y_morales_nivel_cuatro_ca" class="cls-7" cx="397.66" cy="731.39" r="18.15"/>
          <circle id="ridiculo_emociones_sociales_y_morales_nivel_cuatro_cb" class="cls-13" cx="397.66" cy="731.23" r="5.76"/>
        </g>
        <g id="pudor_emociones_sociales_y_morales">
          <circle id="pudor_emociones_sociales_y_morales_nivel_cuatro_ca" class="cls-7" cx="391.46" cy="702.08" r="18.15"/>
          <circle id="pudor_emociones_sociales_y_morales_nivel_cuatro_cb" class="cls-13" cx="389.74" cy="702.55" r="5.76"/>
        </g>
        <g id="recato_emociones_sociales_y_morales">
          <circle id="recato_emociones_sociales_y_morales_nivel_cuatro_ca" class="cls-7" cx="475.29" cy="672.97" r="18.15"/>
          <circle id="recato_emociones_sociales_y_morales_nivel_cuatro_cb" class="cls-13" cx="475.29" cy="671.72" r="5.76"/>
        </g>
        <g id="empatia_emociones_sociales_y_morales">
          <circle id="empatia_emociones_sociales_y_morales_nivel_cuatro_ca" class="cls-7" cx="512.63" cy="583.95" r="18.15"/>
          <circle id="empatia_emociones_sociales_y_morales_nivel_cuatro_cb" class="cls-13" cx="512.63" cy="585.78" r="5.76"/>
        </g>
        <g id="contriccion_emociones_sociales_y_morales">
          <circle id="contriccion_emociones_sociales_y_morales_nivel_cuatro_ca" class="cls-7" cx="689.48" cy="666.94" r="18.15"/>
          <circle id="contriccion_emociones_sociales_y_morales_nivel_cuatro_cb" class="cls-13" cx="690.58" cy="668.23" r="5.76"/>
        </g>
        <g id="azaramiento_emociones_sociales_y_morales">
          <circle id="azaramiento_emociones_sociales_y_morales_nivel_cuatro_ca" class="cls-7" cx="689.48" cy="701.34" r="18.15"/>
          <circle id="azaramiento_emociones_sociales_y_morales_nivel_cuatro_cb" class="cls-13" cx="687.7" cy="702.53" r="5.76"/>
        </g>
        <g id="corte_emociones_sociales_y_morales">
          <circle id="corte_emociones_sociales_y_morales_nivel_cuatro_ca" class="cls-7" cx="654.2" cy="721.89" r="18.15"/>
          <circle id="corte_emociones_sociales_y_morales_nivel_cuatro_cb" class="cls-13" cx="654.2" cy="723.31" r="5.76"/>
        </g>
        <g id="culpa_empatica_emociones_sociales_y_morales">
          <circle id="culpa_empatica_emociones_sociales_y_morales_nivel_cuatro_ca" class="cls-7" cx="692.02" cy="758.19" r="18.15"/>
          <circle id="culpa_empatica_emociones_sociales_y_morales_nivel_cuatro_cb" class="cls-13" cx="692.02" cy="755.27" r="5.76"/>
        </g>
        <g id="culpa_ansiosa_emociones_sociales_y_morales">
          <circle id="culpa_ansiosa_emociones_sociales_y_morales_nivel_cuatro_ca" class="cls-7" cx="704.4" cy="795.08" r="18.15"/>
          <circle id="culpa_ansiosa_emociones_sociales_y_morales_nivel_cuatro_cb" class="cls-13" cx="703.03" cy="796.82" r="5.76"/>
        </g>
        <g id="arrepentimiento_emociones_sociales_y_morales">
          <circle id="arrepentimiento_emociones_sociales_y_morales_nivel_cuatro_ca" class="cls-7" cx="699.84" cy="830.02" r="18.15"/>
          <circle id="arrepentimiento_emociones_sociales_y_morales_nivel_cuatro_cb" class="cls-13" cx="697.78" cy="830.02" r="5.76"/>
        </g>
        <g id="remordimiento_emociones_sociales_y_morales">
          <circle id="remordimiento_emociones_sociales_y_morales_nivel_cuatro_ca" class="cls-7" cx="662.42" cy="843.32" r="18.15"/>
          <circle id="remordimiento_emociones_sociales_y_morales_nivel_cuatro_cb" class="cls-13" cx="661" cy="843.32" r="5.76"/>
        </g>
      </g>
      <g id="emociones_sociales_y_morales_nivel_cinco">
        <g id="solastalgia_emociones_sociales_y_morales">
          <circle id="solastalgia_emociones_sociales_y_morales_nivel_cinco_ca" class="cls-7" cx="608.38" cy="858.27" r="11.5"/>
          <circle id="solastalgia_emociones_sociales_y_morales_nivel_cinco_cb" class="cls-13" cx="608.95" cy="860.34" r="3.13"/>
        </g>
        <g id="compasion_emociones_sociales_y_morales">
          <circle id="compasion_emociones_sociales_y_morales_nivel_cinco_ca" class="cls-7" cx="519.05" cy="676.09" r="11.5"/>
          <circle id="compasion_emociones_sociales_y_morales_nivel_cinco_cb" class="cls-13" cx="517.96" cy="676.09" r="3.13"/>
        </g>
        <g id="patriotismo_emociones_sociales_y_morales">
          <circle id="patriotismo_emociones_sociales_y_morales_nivel_cinco_ca" class="cls-7" cx="515.92" cy="653.28" r="11.5"/>
          <circle id="patriotismo_emociones_sociales_y_morales_nivel_cinco_cb" class="cls-13" cx="515.92" cy="654.83" r="3.13"/>
        </g>
        <g id="piedad_emociones_sociales_y_morales">
          <circle id="piedad_emociones_sociales_y_morales_nivel_cinco_ca" class="cls-7" cx="573.62" cy="652.12" r="11.5"/>
          <circle id="piedad_emociones_sociales_y_morales_nivel_cinco_cb" class="cls-13" cx="572.89" cy="651.92" r="3.13"/>
        </g>
        <g id="kama_muta_emociones_sociales_y_morales">
          <circle id="kama_muta_emociones_sociales_y_morales_nivel_cinco_ca" class="cls-7" cx="564.25" cy="632.02" r="11.5"/>
          <circle id="kama_muta_emociones_sociales_y_morales_nivel_cinco_cb" class="cls-13" cx="564.25" cy="631.8" r="3.13"/>
        </g>
        <g id="sonrojo_emociones_sociales_y_morales">
          <circle id="sonrojo_emociones_sociales_y_morales_nivel_cinco_ca" class="cls-7" cx="626.4" cy="695.08" r="11.5"/>
          <circle id="sonrojo_emociones_sociales_y_morales_nivel_cinco_cb" class="cls-13" cx="626.4" cy="698.21" r="3.13"/>
        </g>
        <g id="bochorno_emociones_sociales_y_morales">
          <circle id="bochorno_emociones_sociales_y_morales_nivel_cinco_ca" class="cls-7" cx="614.47" cy="717.55" r="11.5"/>
          <circle id="bochorno_emociones_sociales_y_morales_nivel_cinco_cb" class="cls-13" cx="614.47" cy="717.55" r="3.13"/>
        </g>
        <g id="solifilia_emociones_sociales_y_morales">
          <circle id="solifilia_emociones_sociales_y_morales_nivel_cinco_ca" class="cls-7" cx="629.53" cy="750.01" r="11.5"/>
          <circle id="solifilia_emociones_sociales_y_morales_nivel_cinco_cb" class="cls-13" cx="628.28" cy="750.5" r="3.13"/>
        </g>
      </g>
      <g id="emociones_sociales_y_morales_lineas">
        <line class="cls-13" x1="570.31" y1="719.49" x2="631.39" y2="686.71"/>
        <line class="cls-13" x1="552.32" y1="713.25" x2="530.78" y2="635.54"/>
        <line class="cls-13" x1="544.79" y1="725.07" x2="451.28" y2="702.32"/>
        <line class="cls-13" x1="427.56" y1="747.45" x2="441.24" y2="703.7"/>
        <line class="cls-13" x1="401.7" y1="728.69" x2="436.76" y2="703.92"/>
        <line class="cls-13" x1="391.89" y1="703.7" x2="434.3" y2="700.21"/>
        <line class="cls-13" x1="429.56" y1="657.03" x2="439.32" y2="691.12"/>
        <line class="cls-13" x1="635.48" y1="681.6" x2="447.14" y2="699.16"/>
        <line class="cls-13" x1="494.48" y1="607.17" x2="517.96" y2="620.96"/>
        <line class="cls-13" x1="513.8" y1="589.02" x2="524.12" y2="616.34"/>
        <line class="cls-13" x1="556.89" y1="580.02" x2="533.73" y2="618.44"/>
        <line class="cls-13" x1="580.76" y1="600.26" x2="540" y2="622.88"/>
        <line class="cls-13" x1="625.16" y1="640.71" x2="636.05" y2="668.23"/>
        <line class="cls-13" x1="658.64" y1="639.04" x2="645.32" y2="669.56"/>
        <line class="cls-13" x1="687.7" y1="669.56" x2="651.9" y2="679.22"/>
        <line class="cls-13" x1="683.19" y1="699.16" x2="651.9" y2="685.08"/>
        <line class="cls-13" x1="648.43" y1="784.76" x2="642.41" y2="685.08"/>
        <line class="cls-13" x1="656.84" y1="788.81" x2="692.02" y2="757.32"/>
        <line class="cls-13" x1="664.04" y1="795.08" x2="699.84" y2="796.82"/>
        <line class="cls-13" x1="661" y1="802.58" x2="697.78" y2="830.02"/>
        <line class="cls-13" x1="659.71" y1="835.25" x2="661" y2="841.94"/>
        <line class="cls-13" x1="654.2" y1="806.6" x2="657.6" y2="824.27"/>
        <line class="cls-13" x1="522.8" y1="815.44" x2="555.28" y2="822.38"/>
        <line class="cls-13" x1="519.65" y1="820.58" x2="545.02" y2="854.42"/>
        <line class="cls-13" x1="567.44" y1="736.52" x2="642.41" y2="788.81"/>
        <line class="cls-13" x1="551.76" y1="736.52" x2="517.96" y2="805.04"/>
      </g>
    </g>
    <g id="actitudes">
      <g id="actitudes_nivel_uno">
        <circle id="actitudes_actitudes_nivel_uno_ca" class="cls-22" cx="131.05" cy="744.06" r="89.23"/>
        <circle id="actitudes_actitudes_nivel_uno_cb" class="cls-13" cx="131.87" cy="744.88" r="13.65"/>
        <text id="actitudes_actitudes_nivel_uno_tx" class="cls-19" transform="translate(149.54 749.54)"><tspan class="cls-46" x="0" y="0">A</tspan><tspan x="7.81" y="0">CTITUDES</tspan></text>
      </g>
      <g id="actitudes_nivel_tres">
        <g id="coraje_actitudes">
          <circle id="coraje_actitudes_nivel_tres_ca" class="cls-22" cx="171.11" cy="780.78" r="26.31"/>
          <circle id="coraje_actitudes_nivel_tres_cb" class="cls-13" cx="172.23" cy="782.38" r="7.49"/>
          <text id="coraje_actitudes_nivel_tres_tx" class="cls-10" transform="translate(183.21 785.28)"><tspan x="0" y="0">Coraje</tspan></text>
        </g>
        <g id="resiliencia_actitudes">
          <circle id="resiliencia_actitudes_nivel_tres_ca" class="cls-22" cx="106.1" cy="710.68" r="26.31"/>
          <circle id="resiliencia_actitudes_nivel_tres_cb" class="cls-13" cx="105.05" cy="711.82" r="6.99"/>
          <text id="resiliencia_actitudes_nivel_tres_tx" class="cls-10" transform="translate(48.76 716.63)"><tspan class="cls-61" x="0" y="0">R</tspan><tspan x="6.01" y="0">esiliencia</tspan></text>
        </g>
      </g>
      <g id="actitudes_nivel_cuatro">
        <g id="temeridad_actitudes">
          <circle id="temeridad_actitudes_nivel_cuatro_ca" class="cls-22" cx="122.57" cy="812.46" r="17.73"/>
          <circle id="temeridad_actitudes_nivel_cuatro_cb" class="cls-13" cx="123.67" cy="813.33" r="5.63"/>
          <text id="temeridad_actitudes_nivel_cuatro_tx" class="cls-21" transform="translate(103.4 827.45)"><tspan class="cls-33" x="0" y="0">T</tspan><tspan x="4.07" y="0">emeridad</tspan></text>
        </g>
        <g id="atrevimiento_actitudes">
          <circle id="atrevimiento_actitudes_nivel_cuatro_ca" class="cls-22" cx="92.68" cy="800.11" r="17.73"/>
          <circle id="atrevimiento_actitudes_nivel_cuatro_cb" class="cls-13" cx="92.68" cy="800.11" r="5.63"/>
          <text id="atrevimiento_actitudes_nivel_cuatro_tx" class="cls-21" transform="translate(64.75 813.33)"><tspan class="cls-30" x="0" y="0">A</tspan><tspan x="5.29" y="0">t</tspan><tspan class="cls-58" x="8.13" y="0">r</tspan><tspan class="cls-70" x="10.97" y="0">e</tspan><tspan class="cls-51" x="15.63" y="0">vimie</tspan><tspan class="cls-5" x="35.95" y="0">n</tspan><tspan class="cls-4" x="40.68" y="0">t</tspan><tspan x="43.47" y="0">o</tspan></text>
        </g>
        <g id="valentia_actitudes">
          <circle id="valentia_actitudes_nivel_cuatro_ca" class="cls-22" cx="72.16" cy="756.17" r="17.73"/>
          <circle id="valentia_actitudes_nivel_cuatro_cb" class="cls-13" cx="74.17" cy="756.17" r="5.63"/>
          <text id="valentia_actitudes_nivel_cuatro_tx" class="cls-21" transform="translate(57.98 769.2)"><tspan class="cls-65" x="0" y="0">V</tspan><tspan class="cls-51" x="5.07" y="0">ale</tspan><tspan class="cls-5" x="16.63" y="0">n</tspan><tspan x="21.36" y="0">tía</tspan></text>
        </g>
        <g id="mindset_actitudes">
          <circle id="mindset_actitudes_nivel_cuatro_ca" class="cls-22" cx="152.47" cy="682.88" r="17.73"/>
          <circle id="mindset_actitudes_nivel_cuatro_cb" class="cls-13" cx="152.47" cy="682.88" r="5.63"/>
          <text id="mindset_actitudes_nivel_cuatro_tx" class="cls-21" transform="translate(161.79 688.51)"><tspan x="0" y="0">Minds</tspan><tspan class="cls-5" x="22.72" y="0">e</tspan><tspan x="27.46" y="0">t</tspan></text>
        </g>
        <g id="fortaleza_actitudes">
          <circle id="fortaleza_actitudes_nivel_cuatro_ca" class="cls-22" cx="176.95" cy="718.8" r="17.73"/>
          <circle id="fortaleza_actitudes_nivel_cuatro_cb" class="cls-13" cx="176.95" cy="718.8" r="5.63"/>
          <text id="fortaleza_actitudes_nivel_cuatro_tx" class="cls-21" transform="translate(159.42 733.35)"><tspan class="cls-54" x="0" y="0">F</tspan><tspan x="4.45" y="0">ortal</tspan><tspan class="cls-59" x="21.86" y="0">e</tspan><tspan x="26.59" y="0">za</tspan></text>
        </g>
      </g>
      <g id="actitudes_nivel_cinco">
        <g id="actitud_negativa_actitudes">
          <circle id="actitud_negativa_actitudes_nivel_cuatro_ca" class="cls-22" cx="163.96" cy="803.41" r="7.43"/>
          <circle id="actitud_negativa_actitudes_nivel_cuatro_cb" class="cls-13" cx="163.96" cy="801.13" r="2.98"/>
          <text id="actitud_negativa_actitudes_nivel_cuatro_tx" class="cls-21" transform="translate(150.31 812.46)"><tspan class="cls-63" x="0" y="0">A</tspan><tspan x="5.34" y="0">ctitud</tspan><tspan x="-2.58" y="6.06">neg</tspan><tspan class="cls-64" x="12.01" y="6.06">a</tspan><tspan x="16.46" y="6.06">ti</tspan><tspan class="cls-56" x="21.16" y="6.06">v</tspan><tspan x="25.41" y="6.06">a</tspan></text>
        </g>
        <g id="actitud_cerrada_actitudes">
          <circle id="actitud_cerrada_actitudes_nivel_cuatro_ca" class="cls-22" cx="119.59" cy="763.51" r="7.43"/>
          <circle id="actitud_cerrada_actitudes_nivel_cuatro_cb" class="cls-13" cx="119.59" cy="761.5" r="2.98"/>
          <text id="actitud_cerrada_actitudes_nivel_cuatro_tx" class="cls-24" transform="translate(93.33 771.23)"><tspan class="cls-34" x="0" y="0">A</tspan><tspan class="cls-47" x="4.7" y="0">ctitud </tspan><tspan class="cls-66" x="25.84" y="0">c</tspan><tspan x="29.74" y="0">errada</tspan></text>
        </g>
        <g id="animo_negativo_actitudes">
          <circle id="animo_negativo_actitudes_nivel_cuatro_ca" class="cls-22" cx="85.93" cy="780.78" r="7.43"/>
          <circle id="animo_negativo_actitudes_nivel_cuatro_cb" class="cls-13" cx="85.93" cy="778.14" r="2.98"/>
          <text id="animo_negativo_actitudes_nivel_cuatro_tx" class="cls-24" transform="translate(58.02 789.87)"><tspan x="0" y="0">Ánimo neg</tspan><tspan class="cls-52" x="36.12" y="0">a</tspan><tspan x="40.04" y="0">ti</tspan><tspan class="cls-37" x="44.18" y="0">v</tspan><tspan x="47.88" y="0">o</tspan></text>
        </g>
        <g id="predisposiciones_actitudes">
          <circle id="predisposiciones_actitudes_nivel_cuatro_ca" class="cls-22" cx="77.93" cy="731.11" r="7.43"/>
          <circle id="predisposiciones_actitudes_nivel_cuatro_cb" class="cls-13" cx="77.93" cy="728.25" r="2.98"/>
          <text id="predisposiciones_actitudes_nivel_cuatro_tx" class="cls-24" transform="translate(47.74 738.44)"><tspan x="0" y="0">P</tspan><tspan class="cls-55" x="4.43" y="0">r</tspan><tspan x="6.93" y="0">edisposiciones</tspan></text>
        </g>
        <g id="animo_positivo_actitudes">
          <circle id="animo_positivo_actitudes_nivel_cuatro_ca" class="cls-22" cx="82.95" cy="683.85" r="7.43"/>
          <circle id="animo_positivo_actitudes_nivel_cuatro_cb" class="cls-13" cx="82.77" cy="681.39" r="2.98"/>
          <text id="animo_positivo_actitudes_nivel_cuatro_tx" class="cls-24" transform="translate(70.62 692.17)"><tspan x="0" y="0">Ánimo positi</tspan><tspan class="cls-44" x="41.23" y="0">v</tspan><tspan class="cls-47" x="44.93" y="0">o</tspan></text>
        </g>
        <g id="actitud_positiva_actitudes">
          <circle id="actitud_positiva_actitudes_nivel_cuatro_ca" class="cls-22" cx="115.04" cy="666.93" r="7.43"/>
          <circle id="actitud_positiva_actitudes_nivel_cuatro_cb" class="cls-13" cx="115.04" cy="665.15" r="2.98"/>
          <text id="actitud_positiva_actitudes_nivel_cuatro_tx" class="cls-24" transform="translate(101.88 675.65)"><tspan class="cls-34" x="0" y="0">A</tspan><tspan class="cls-47" x="4.7" y="0">ctitud</tspan><tspan x="0" y="5.34">positi</tspan><tspan class="cls-49" x="17.94" y="5.34">v</tspan><tspan x="21.68" y="5.34">a</tspan></text>
        </g>
        <g id="grit_actitudes">
          <circle id="grit_actitudes_nivel_cuatro_ca" class="cls-22" cx="132.41" cy="715.49" r="7.43"/>
          <circle id="grit_actitudes_nivel_cuatro_cb" class="cls-13" cx="133.88" cy="710.68" r="2.98"/>
          <text id="grit_actitudes_nivel_cuatro_tx" class="cls-24" transform="translate(125.14 721.27)"><tspan x="0" y="0">Grit</tspan><tspan x="-16.16" y="5.34">(</tspan><tspan class="cls-40" x="-14.15" y="5.34">P</tspan><tspan class="cls-47" x="-9.79" y="5.34">ersis</tspan><tspan class="cls-69" x="5.58" y="5.34">t</tspan><tspan class="cls-47" x="8.03" y="5.34">encia)</tspan></text>
        </g>
        <g id="intenciones_actitudes">
          <circle id="intenciones_actitudes_nivel_cuatro_ca" class="cls-22" cx="181.7" cy="759.7" r="7.43"/>
          <circle id="intenciones_actitudes_nivel_cuatro_cb" class="cls-13" cx="181.7" cy="757.45" r="2.98"/>
          <text id="intenciones_actitudes_nivel_cuatro_tx" class="cls-24" transform="translate(162.41 767.54)"><tspan x="0" y="0">I</tspan><tspan class="cls-73" x="1.85" y="0">n</tspan><tspan class="cls-53" x="6.01" y="0">t</tspan><tspan x="8.47" y="0">enciones</tspan></text>
        </g>
      </g>
      <g id="actitudes_lineas">
        <line class="cls-13" x1="148.69" y1="685.04" x2="105.73" y2="709.35"/>
        <line class="cls-13" x1="172.23" y1="717.8" x2="109.91" y2="713.18"/>
        <line class="cls-13" x1="98.14" y1="763.51" x2="77.93" y2="758.52"/>
        <line class="cls-13" x1="168.2" y1="780.78" x2="138.66" y2="773.5"/>
        <line class="cls-13" x1="168.2" y1="783.36" x2="93.4" y2="800.78"/>
        <line class="cls-13" x1="172.23" y1="782.38" x2="124.14" y2="814.11"/>
      </g>
    </g>
    <g id="sorpresa">
      <g id="sorpresa_nivel_uno">
        <ellipse id="sorpresa_sorpresa_nivel_uno_ca" class="cls-20" cx="557.42" cy="998.58" rx="94.68" ry="125.87" transform="translate(-356.87 311.6) rotate(-23.91)"/>
        <ellipse id="sorpresa_sorpresa_nivel_uno_cb" class="cls-13" cx="555.83" cy="998.03" rx="12.08" ry="18.12" transform="translate(-424.55 411.63) rotate(-30)"/>
        <text id="sorpresa_sorpresa_nivel_uno_tx" class="cls-19" transform="translate(475.62 1005.8)"><tspan x="0" y="0">SORPRE</tspan><tspan class="cls-35" x="46.79" y="0">S</tspan><tspan class="cls-57" x="53.93" y="0">A</tspan></text>
      </g>
      <g id="sorpresa_nivel_tres_tx">
        <g id="estupor_sorpresa">
          <circle id="estupor_sorpresa_nivel_tres_ca" class="cls-20" cx="517.37" cy="920.26" r="17.73"/>
          <circle id="estupor_sorpresa_nivel_tres_cb" class="cls-13" cx="516.37" cy="921.25" r="5.23"/>
          <text id="estupor_sorpresa_nivel_tres_tx" class="cls-27" transform="translate(500.77 912.58)"><tspan x="0" y="0">Estupo</tspan><tspan class="cls-36" x="28.08" y="0">r</tspan></text>
        </g>
        <g id="estupefaccion_sorpresa">
          <circle id="estupefaccion_sorpresa_nivel_tres_ca" class="cls-20" cx="558.71" cy="912.58" r="17.73"/>
          <circle id="estupefaccion_sorpresa_nivel_tres_cb" class="cls-13" cx="559.86" cy="913.81" r="5.23"/>
          <text id="estupefaccion_sorpresa_nivel_tres_tx" class="cls-27" transform="translate(533.98 904.56)"><tspan x="0" y="0">Estup</tspan><tspan class="cls-48" x="22.93" y="0">e</tspan><tspan x="27.96" y="0">fa</tspan><tspan class="cls-62" x="35.67" y="0">c</tspan><tspan x="40.39" y="0">ción</tspan></text>
        </g>
        <g id="conmocion_sorpresa">
          <circle id="conmocion_sorpresa_nivel_tres_ca" class="cls-20" cx="546.95" cy="950.12" r="17.73"/>
          <circle id="conmocion_sorpresa_nivel_tres_cb" class="cls-13" cx="549.4" cy="951.56" r="5.23"/>
          <text id="conmocion_sorpresa_nivel_tres_tx" class="cls-27" transform="translate(525.3 943.01)"><tspan x="0" y="0">Conmoción</tspan></text>
        </g>
        <g id="confusion_sorpresa">
          <circle id="confusion_sorpresa_nivel_tres_ca" class="cls-20" cx="594.17" cy="946.34" r="17.73"/>
          <circle id="confusion_sorpresa_nivel_tres_cb" class="cls-13" cx="594.29" cy="948.24" r="5.23"/>
          <text id="confusion_sorpresa_nivel_tres_tx" class="cls-27" transform="translate(579.26 939.85)"><tspan x="0" y="0">Co</tspan><tspan class="cls-72" x="11.01" y="0">n</tspan><tspan x="16.03" y="0">fusión</tspan></text>
        </g>
        <g id="pasmo_sorpresa">
          <circle id="pasmo_sorpresa_nivel_tres_ca" class="cls-20" cx="609.05" cy="998.03" r="17.73"/>
          <circle id="pasmo_sorpresa_nivel_tres_cb" class="cls-13" cx="609.05" cy="998.58" r="5.23"/>
          <text id="pasmo_sorpresa_nivel_tres_tx" class="cls-27" transform="translate(595.37 989.09)"><tspan class="cls-38" x="0" y="0">P</tspan><tspan class="cls-43" x="5.3" y="0">asmo</tspan></text>
        </g>
        <g id="asombro_sorpresa">
          <circle id="asombro_sorpresa_nivel_tres_ca" class="cls-20" cx="614.28" cy="1042.43" r="17.73"/>
          <circle id="asombro_sorpresa_nivel_tres_cb" class="cls-13" cx="615.53" cy="1042.43" r="5.23"/>
          <text id="asombro_sorpresa_nivel_tres_tx" class="cls-27" transform="translate(601.09 1057.66)"><tspan class="cls-39" x="0" y="0">A</tspan><tspan x="5.75" y="0">somb</tspan><tspan class="cls-42" x="28.38" y="0">r</tspan><tspan x="31.4" y="0">o</tspan></text>
        </g>
        <g id="anticipacion_sorpresa">
          <circle id="anticipacion_sorpresa_nivel_tres_ca" class="cls-20" cx="582.12" cy="1079.15" r="17.73"/>
          <circle id="anticipacion_sorpresa_nivel_tres_cb" class="cls-13" cx="582.12" cy="1080.75" r="5.23"/>
          <text id="anticipacion_sorpresa_nivel_tres_tx" class="cls-27" transform="translate(562.52 1096.88)"><tspan x="0" y="0">A</tspan><tspan class="cls-62" x="5.82" y="0">n</tspan><tspan class="cls-50" x="10.84" y="0">ticipación</tspan></text>
        </g>
        <g id="perplejidad_sorpresa">
          <circle id="perplejidad_sorpresa_nivel_tres_ca" class="cls-20" cx="538.1" cy="1070.75" r="17.73"/>
          <circle id="perplejidad_sorpresa_nivel_tres_cb" class="cls-13" cx="538.1" cy="1071.87" r="5.23"/>
          <text id="perplejidad_sorpresa_nivel_tres_tx" class="cls-27" transform="translate(511.24 1087.04)"><tspan class="cls-3" x="0" y="0">P</tspan><tspan x="5.27" y="0">erplejidad</tspan></text>
        </g>
        <g id="desconcierto_sorpresa">
          <circle id="desconcierto_sorpresa_nivel_tres_ca" class="cls-20" cx="523.25" cy="1032.58" r="17.73"/>
          <circle id="desconcierto_sorpresa_nivel_tres_cb" class="cls-13" cx="521.86" cy="1034.74" r="5.23"/>
          <text id="desconcierto_sorpresa_nivel_tres_tx" class="cls-27" transform="translate(493.67 1048.91)"><tspan x="0" y="0">Des</tspan><tspan class="cls-62" x="15.42" y="0">c</tspan><tspan class="cls-50" x="20.14" y="0">oncier</tspan><tspan class="cls-68" x="45.29" y="0">t</tspan><tspan x="48.26" y="0">o</tspan></text>
        </g>
        <g id="extraneza_sorpresa">
          <circle id="extraneza_sorpresa_nivel_tres_ca" class="cls-20" cx="504.13" cy="962.57" r="17.73"/>
          <circle id="extraneza_sorpresa_nivel_tres_cb" class="cls-13" cx="504.13" cy="962.57" r="5.23"/>
          <text id="extraneza_sorpresa_nivel_tres_tx" class="cls-27" transform="translate(484.33 953.47)"><tspan x="0" y="0">Extrañ</tspan><tspan class="cls-38" x="25.58" y="0">e</tspan><tspan x="30.61" y="0">za</tspan></text>
        </g>
      </g>
      <g id="sorpresa_lineas">
        <line class="cls-13" x1="592.64" y1="950.12" x2="559.41" y2="991.74"/>
        <line class="cls-13" x1="609.05" y1="998.58" x2="559.86" y2="998.58"/>
        <line class="cls-13" x1="611.9" y1="1039.97" x2="564.68" y2="1005.8"/>
        <line class="cls-13" x1="581.24" y1="1079.15" x2="559.41" y2="1007"/>
        <line class="cls-13" x1="538.1" y1="1070.75" x2="554.63" y2="1008.2"/>
        <line class="cls-13" x1="523.25" y1="1032.58" x2="550.76" y2="1003.81"/>
        <line class="cls-13" x1="549.4" y1="953.47" x2="554.63" y2="991.74"/>
      </g>
    </g>
    <g id="tristeza">
      <g id="tristeza_nivel_uno">
        <circle id="tristeza_tristeza_nivel_uno_ca" class="cls-28" cx="819.86" cy="1017.86" r="187.75"/>
        <circle id="tristeza_tristeza_nivel_uno_cb" class="cls-13" cx="818.96" cy="1024.7" r="20.28"/>
        <text id="tristeza_tristeza_nivel_uno_tx" class="cls-19" transform="translate(851.73 1029.33)"><tspan x="0" y="0">TRISTEZ</tspan><tspan class="cls-57" x="47.88" y="0">A</tspan></text>
      </g>
      <g id="tristeza_nivel_dos">
        <g id="agonia_tristeza">
          <circle id="agonia_tristeza_nivel_dos_ca" class="cls-28" cx="786.37" cy="1115.39" r="64.95"/>
          <circle id="agonia_tristeza_nivel_dos_cb" class="cls-13" cx="783.78" cy="1113.82" r="13.66"/>
        </g>
        <g id="resignacion_tristeza">
          <circle id="resignacion_tristeza_nivel_dos_ca" class="cls-28" cx="742.45" cy="1087.04" r="67.99"/>
          <circle id="resignacion_tristeza_nivel_dos_cb" class="cls-13" cx="742.45" cy="1087.04" r="13.66"/>
        </g>
        <g id="desilusion_tristeza">
          <circle id="desilusion_tristeza_nivel_dos_ca" class="cls-28" cx="703.03" cy="1067.69" r="67.67"/>
          <circle id="desilusion_tristeza_nivel_dos_cb" class="cls-13" cx="703.03" cy="1067.69" r="13.66"/>
        </g>
        <g id="decepcion_tristeza">
          <circle id="decepcion_tristeza_nivel_dos_ca" class="cls-28" cx="671.57" cy="984.92" r="67.75"/>
          <circle id="decepcion_tristeza_nivel_dos_cb" class="cls-13" cx="671.57" cy="984.92" r="13.66"/>
        </g>
        <g id="nostalgia_tristeza">
          <circle id="nostalgia_tristeza_nivel_dos_ca" class="cls-28" cx="768.23" cy="928.61" r="76.26"/>
          <circle id="nostalgia_tristeza_nivel_dos_cb" class="cls-13" cx="768.23" cy="946.34" r="13.66"/>
        </g>
        <g id="soledad_tristeza">
          <circle id="soledad_tristeza_nivel_dos_ca" class="cls-28" cx="711.53" cy="928.61" r="67.76"/>
          <circle id="soledad_tristeza_nivel_dos_cb" class="cls-13" cx="711.53" cy="928.61" r="13.66"/>
        </g>
        <g id="melancolia_tristeza">
          <circle id="melancolia_tristeza_nivel_dos_ca" class="cls-28" cx="787.72" cy="921.2" r="76.26"/>
          <circle id="melancolia_tristeza_nivel_dos_cb" class="cls-13" cx="787.72" cy="921.2" r="13.66"/>
        </g>
        <g id="infelicidad_tristeza">
          <circle id="infelicidad_tristeza_nivel_dos_ca" class="cls-28" cx="806.2" cy="865.81" r="66.52"/>
          <circle id="infelicidad_tristeza_nivel_dos_cb" class="cls-13" cx="806.2" cy="865.81" r="13.66"/>
        </g>
        <g id="desaliento_tristeza">
          <circle id="desaliento_tristeza_nivel_dos_ca" class="cls-28" cx="847.6" cy="881.57" r="72.11"/>
          <circle id="desaliento_tristeza_nivel_dos_cb" class="cls-13" cx="847.6" cy="881.57" r="13.66"/>
        </g>
        <g id="pesimismo_tristeza">
          <circle id="pesimismo_tristeza_nivel_dos_ca" class="cls-28" cx="890.8" cy="895.23" r="72.11"/>
          <circle id="pesimismo_tristeza_nivel_dos_cb" class="cls-13" cx="890.8" cy="895.23" r="13.66"/>
        </g>
        <g id="desgana_tristeza">
          <circle id="desgana_tristeza_nivel_dos_ca" class="cls-28" cx="947.32" cy="867.9" r="72.11"/>
          <circle id="desgana_tristeza_nivel_dos_cb" class="cls-13" cx="947.32" cy="867.9" r="13.66"/>
        </g>
        <g id="aburrimiento_tristeza">
          <circle id="aburrimiento_tristeza_nivel_dos_ca" class="cls-28" cx="992.14" cy="889.32" r="72.11"/>
          <circle id="aburrimiento_tristeza_nivel_dos_cb" class="cls-13" cx="992.14" cy="889.32" r="13.66"/>
        </g>
        <g id="sufrimiento_tristeza">
          <circle id="sufrimiento_tristeza_nivel_dos_ca" class="cls-28" cx="977.02" cy="932.67" r="72.11"/>
          <circle id="sufrimiento_tristeza_nivel_dos_cb" class="cls-13" cx="977.02" cy="932.67" r="13.66"/>
        </g>
        <g id="dolor_tristeza">
          <circle id="dolor_tristeza_nivel_dos_ca" class="cls-28" cx="995.71" cy="967.92" r="72.11"/>
          <circle id="dolor_tristeza_nivel_dos_cb" class="cls-13" cx="993.88" cy="967.92" r="13.66"/>
        </g>
        <g id="duelo_tristeza">
          <circle id="duelo_tristeza_nivel_dos_ca" class="cls-28" cx="952.95" cy="1000.57" r="72.11"/>
          <circle id="duelo_tristeza_nivel_dos_cb" class="cls-13" cx="952.95" cy="1000.57" r="13.66"/>
        </g>
        <g id="pena_tristeza">
          <circle id="pena_tristeza_nivel_dos_ca" class="cls-28" cx="948.44" cy="1049.92" r="72.11"/>
          <circle id="pena_tristeza_nivel_dos_cb" class="cls-13" cx="947.19" cy="1049.92" r="13.66"/>
        </g>
        <g id="pesar_tristeza">
          <circle id="pesar_tristeza_nivel_dos_ca" class="cls-28" cx="955.47" cy="1099.26" r="72.11"/>
          <circle id="pesar_tristeza_nivel_dos_cb" class="cls-13" cx="955.47" cy="1099.26" r="13.66"/>
        </g>
        <g id="afliccion_tristeza">
          <circle id="afliccion_tristeza_nivel_dos_ca" class="cls-28" cx="955.47" cy="1142.82" r="72.11"/>
          <circle id="afliccion_tristeza_nivel_dos_cb" class="cls-13" cx="955.47" cy="1142.82" r="13.66"/>
        </g>
        <g id="desconsuelo_tristeza">
          <circle id="desconsuelo_tristeza_nivel_dos_ca" class="cls-28" cx="916.95" cy="1154.34" r="72.11"/>
          <circle id="desconsuelo_tristeza_nivel_dos_cb" class="cls-13" cx="916.95" cy="1154.34" r="13.66"/>
        </g>
        <g id="disgusto_tristeza">
          <circle id="disgusto_tristeza_nivel_dos_ca" class="cls-28" cx="862.63" cy="1125.18" r="72.11"/>
          <circle id="disgusto_tristeza_nivel_dos_cb" class="cls-13" cx="862.63" cy="1125.18" r="13.66"/>
        </g>
        <g id="amargura_tristeza">
          <circle id="amargura_tristeza_nivel_dos_ca" class="cls-28" cx="817.27" cy="1148.61" r="64.95"/>
          <circle id="amargura_tristeza_nivel_dos_cb" class="cls-13" cx="817.27" cy="1148.61" r="13.66"/>
        </g>
        <g id="depresion_tristeza">
          <circle id="depresion_tristeza_nivel_dos_ca" class="cls-28" cx="802.6" cy="1256.06" r="90.12"/>
          <circle id="depresion_tristeza_nivel_dos_cb" class="cls-13" cx="850.54" cy="1195.75" r="16.46"/>
        </g>
      </g>
      <g id="tristeza_nivel_tres">
        <g id="frustracion_tristeza">
          <circle id="frustracion_tristeza_nivel_tres_ca" class="cls-28" cx="641.87" cy="951.05" r="25.59"/>
          <circle id="frustracion_tristeza_nivel_tres_cb" class="cls-13" cx="641.87" cy="951.05" r="6.51"/>
        </g>
        <g id="morina_tristeza">
          <circle id="morina_tristeza_nivel_tres_ca" class="cls-28" cx="723.57" cy="881.57" r="25.59"/>
          <circle id="morina_tristeza_nivel_tres_cb" class="cls-13" cx="723.57" cy="881.57" r="6.64"/>
        </g>
        <g id="congoja_tristeza">
          <circle id="congoja_tristeza_nivel_tres_ca" class="cls-28" cx="1022.59" cy="1020.35" r="25.59"/>
          <circle id="congoja_tristeza_nivel_tres_cb" class="cls-13" cx="1022.59" cy="1020.35" r="6.98"/>
        </g>
        <g id="abatimiento_tristeza">
          <circle id="abatimiento_tristeza_nivel_tres_ca" class="cls-28" cx="994.73" cy="1184.92" r="25.59"/>
          <circle id="abatimiento_tristeza_nivel_tres_cb" class="cls-13" cx="994.31" cy="1184.92" r="6.57"/>
        </g>
        <g id="desmoralizacion_tristeza">
          <circle id="desmoralizacion_tristeza_nivel_tres_ca" class="cls-20" cx="647.76" cy="1066.64" r="17.73"/>
          <circle id="desmoralizacion_tristeza_nivel_tres_cb" class="cls-13" cx="647.76" cy="1066.64" r="5.23"/>
        </g>
      </g>
      <g id="tristeza_nivel_cuatro">
        <g id="tribulacion_tristeza">
          <circle id="tribulacion_tristeza_nivel_cuatro_ca" class="cls-28" cx="736.87" cy="1144.43" r="16.36"/>
          <circle id="tribulacion_tristeza_nivel_cuatro_cb" class="cls-13" cx="736.87" cy="1144.43" r="5.58"/>
        </g>
        <g id="desanimo_tristeza">
          <circle id="desanimo_tristeza_nivel_cuatro_ca" class="cls-28" cx="673.01" cy="1118.65" r="16.36"/>
          <circle id="desanimo_tristeza_nivel_cuatro_cb" class="cls-13" cx="673.01" cy="1118.65" r="5.58"/>
        </g>
        <g id="humillacion_tristeza">
          <circle id="humillacion_tristeza_nivel_cuatro_ca" class="cls-28" cx="661.79" cy="1030.28" r="16.36"/>
          <circle id="humillacion_tristeza_nivel_cuatro_cb" class="cls-13" cx="661.79" cy="1030.28" r="5.58"/>
        </g>
        <g id="abandono_tristeza">
          <circle id="abandono_tristeza_nivel_cuatro_ca" class="cls-28" cx="678.53" cy="903.78" r="16.36"/>
          <circle id="abandono_tristeza_nivel_cuatro_cb" class="cls-13" cx="678.53" cy="903.78" r="5.58"/>
        </g>
        <g id="anoranza_tristeza">
          <circle id="anoranza_tristeza_nivel_cuatro_ca" class="cls-28" cx="739.57" cy="864.78" r="16.36"/>
          <circle id="anoranza_tristeza_nivel_cuatro_cb" class="cls-13" cx="739.57" cy="864.78" r="5.61"/>
        </g>
        <g id="sehnsucht_tristeza">
          <circle id="sehnsucht_tristeza_nivel_cuatro_ca" class="cls-28" cx="773.83" cy="873.86" r="16.36"/>
          <circle id="sehnsucht_tristeza_nivel_cuatro_cb" class="cls-13" cx="773.83" cy="873.86" r="5.61"/>
        </g>
        <g id="saudade_tristeza">
          <circle id="saudade_tristeza_nivel_cuatro_ca" class="cls-28" cx="762.62" cy="850.16" r="16.36"/>
          <circle id="saudade_tristeza_nivel_cuatro_cb" class="cls-13" cx="762.62" cy="850.16" r="5.61"/>
        </g>
        <g id="hastio_tristeza">
          <circle id="hastio_tristeza_nivel_cuatro_ca" class="cls-28" cx="1031.59" cy="886.49" r="16.36"/>
          <circle id="hastio_tristeza_nivel_cuatro_cb" class="cls-13" cx="1031.59" cy="886.49" r="5.61"/>
        </g>
        <g id="pesadumbre_tristeza">
          <circle id="pesadumbre_tristeza_nivel_cuatro_ca" class="cls-28" cx="1008.55" cy="1070.71" r="16.36"/>
          <circle id="pesadumbre_tristeza_nivel_cuatro_cb" class="cls-13" cx="1008.55" cy="1070.32" r="5.61"/>
        </g>
        <g id="grima_tristeza">
          <circle id="grima_tristeza_nivel_cuatro_ca" class="cls-28" cx="1002.95" cy="1110.28" r="16.36"/>
          <circle id="grima_tristeza_nivel_cuatro_cb" class="cls-13" cx="1002.95" cy="1110.28" r="5.61"/>
        </g>
        <g id="desolacion_tristeza">
          <circle id="desolacion_tristeza_nivel_cuatro_ca" class="cls-28" cx="947.19" cy="1193.24" r="16.36"/>
          <circle id="desolacion_tristeza_nivel_cuatro_cb" class="cls-13" cx="947.19" cy="1193.24" r="5.79"/>
        </g>
        <g id="desdicha_tristeza">
          <circle id="desdicha_tristeza_nivel_cuatro_ca" class="cls-28" cx="909.07" cy="1199.03" r="16.36"/>
          <circle id="desdicha_tristeza_nivel_cuatro_cb" class="cls-13" cx="909.07" cy="1199.03" r="5.79"/>
        </g>
      </g>
      <g id="tristeza_nivel_cinco">
        <g id="agobio_tristeza">
          <circle id="agobio_tristeza_nivel_cinco_ca" class="cls-28" cx="794.27" cy="1290.11" r="7.98"/>
          <circle id="agobio_tristeza_nivel_cinco_cb" class="cls-13" cx="794.27" cy="1287.85" r="3.09"/>
        </g>
        <g id="suspenso_tristeza">
          <circle id="suspenso_tristeza_nivel_cinco_ca" class="cls-28" cx="813.45" cy="1310.55" r="7.98"/>
          <circle id="suspenso_tristeza_nivel_cinco_cb" class="cls-13" cx="813.47" cy="1307.45" r="3.09"/>
        </g>
        <g id="desesperanza_tristeza">
          <circle id="desesperanza_tristeza_nivel_cinco_ca" class="cls-28" cx="758.33" cy="1174.26" r="7.98"/>
          <circle id="desesperanza_tristeza_nivel_cinco_cb" class="cls-13" cx="758.33" cy="1172.75" r="3.51"/>
        </g>
        <g id="languidez_tristeza">
          <circle id="languidez_tristeza_nivel_cinco_ca" class="cls-28" cx="740.39" cy="1061.41" r="7.98"/>
          <circle id="languidez_tristeza_nivel_cinco_cb" class="cls-13" cx="740.39" cy="1060.06" r="3.51"/>
        </g>
        <g id="desencanto_tristeza">
          <circle id="desencanto_tristeza_nivel_cinco_ca" class="cls-28" cx="737.87" cy="1035.81" r="7.98"/>
          <circle id="desencanto_tristeza_nivel_cinco_cb" class="cls-13" cx="737.87" cy="1032.35" r="3.51"/>
        </g>
        <g id="desengano_tristeza">
          <circle id="desengano_tristeza_nivel_cinco_ca" class="cls-28" cx="679.36" cy="1043.88" r="7.98"/>
          <circle id="desengano_tristeza_nivel_cinco_cb" class="cls-13" cx="679.71" cy="1042.43" r="3.51"/>
        </g>
        <g id="lastima_tristeza">
          <circle id="lastima_tristeza_nivel_cinco_ca" class="cls-28" cx="705.79" cy="1010.29" r="7.98"/>
          <circle id="lastima_tristeza_nivel_cinco_cb" class="cls-13" cx="705.79" cy="1008.14" r="3.51"/>
        </g>
        <g id="chasco_tristeza">
          <circle id="chasco_tristeza_nivel_cinco_ca" class="cls-28" cx="704.4" cy="959.46" r="7.98"/>
          <circle id="chasco_tristeza_nivel_cinco_cb" class="cls-13" cx="704.83" cy="957.56" r="3.51"/>
        </g>
        <g id="fracaso_tristeza">
          <circle id="fracaso_tristeza_nivel_cinco_ca" class="cls-28" cx="682.05" cy="940.27" r="7.98"/>
          <circle id="fracaso_tristeza_nivel_cinco_cb" class="cls-13" cx="682.05" cy="938.75" r="3.51"/>
        </g>
        <g id="desamparo_tristeza">
          <circle id="desamparo_tristeza_nivel_cinco_ca" class="cls-28" cx="736.36" cy="903.18" r="7.98"/>
          <circle id="desamparo_tristeza_nivel_cinco_cb" class="cls-13" cx="736.05" cy="901.71" r="3.51"/>
        </g>
        <g id="decaimiento_tristeza">
          <circle id="decaimiento_tristeza_nivel_cinco_ca" class="cls-28" cx="863.47" cy="828.5" r="7.98"/>
          <circle id="decaimiento_tristeza_nivel_cinco_cb" class="cls-13" cx="863.47" cy="824.98" r="3.51"/>
        </g>
        <g id="apatia_tristeza">
          <circle id="apatia_tristeza_nivel_cinco_ca" class="cls-28" cx="917.29" cy="857.75" r="7.98"/>
          <circle id="apatia_tristeza_nivel_cinco_cb" class="cls-13" cx="917.29" cy="857.75" r="3.51"/>
        </g>
        <g id="abulia_tristeza">
          <circle id="abulia_tristeza_nivel_cinco_ca" class="cls-28" cx="927.18" cy="840.52" r="7.98"/>
          <circle id="abulia_tristeza_nivel_cinco_cb" class="cls-13" cx="927.73" cy="839.93" r="3.51"/>
        </g>
        <g id="acidia_tristeza">
          <circle id="acidia_tristeza_nivel_cinco_ca" class="cls-28" cx="953.16" cy="836.89" r="7.98"/>
          <circle id="acidia_tristeza_nivel_cinco_cb" class="cls-13" cx="952.79" cy="834.89" r="3.51"/>
        </g>
        <g id="anorexia_tristeza">
          <circle id="anorexia_tristeza_nivel_cinco_ca" class="cls-28" cx="984.29" cy="841.24" r="7.98"/>
          <circle id="anorexia_tristeza_nivel_cinco_cb" class="cls-13" cx="984.29" cy="839.93" r="3.51"/>
        </g>
        <g id="esplin_tristeza">
          <circle id="esplin_tristeza_nivel_cinco_ca" class="cls-28" cx="983.39" cy="857.75" r="7.98"/>
          <circle id="esplin_tristeza_nivel_cinco_cb" class="cls-13" cx="983.39" cy="855.95" r="3.51"/>
        </g>
        <g id="tedio_tristeza">
          <circle id="tedio_tristeza_nivel_cinco_ca" class="cls-28" cx="973.31" cy="871.67" r="7.98"/>
          <circle id="tedio_tristeza_nivel_cinco_cb" class="cls-13" cx="969.8" cy="870.62" r="3.51"/>
        </g>
        <g id="conmiseracion_tristeza">
          <circle id="conmiseracion_tristeza_nivel_cinco_ca" class="cls-28" cx="973.76" cy="1021.4" r="7.98"/>
          <circle id="conmiseracion_tristeza_nivel_cinco_cb" class="cls-13" cx="973.76" cy="1019.73" r="3.51"/>
        </g>
        <g id="postracion_tristeza">
          <circle id="postracion_tristeza_nivel_cinco_ca" class="cls-28" cx="1005.59" cy="1160.76" r="7.98"/>
          <circle id="postracion_tristeza_nivel_cinco_cb" class="cls-13" cx="1005.59" cy="1158.76" r="3.51"/>
        </g>
        <g id="murria_tristeza">
          <circle id="murria_tristeza_nivel_cinco_ca" class="cls-28" cx="998.56" cy="1200.62" r="7.98"/>
          <circle id="murria_tristeza_nivel_cinco_cb" class="cls-13" cx="998.56" cy="1199.03" r="3.51"/>
        </g>
      </g>
      <g id="tristeza_lineas">
        <line class="cls-13" x1="804.68" y1="1022.6" x2="679.71" y2="988.45"/>
        <line class="cls-13" x1="806.2" y1="1014.85" x2="711.53" y2="928.61"/>
        <line class="cls-13" x1="810.44" y1="1013.37" x2="774.06" y2="954.76"/>
        <line class="cls-13" x1="814.04" y1="1011.65" x2="792.54" y2="930.44"/>
        <line class="cls-13" x1="816.4" y1="1011.65" x2="806.2" y2="874.14"/>
        <line class="cls-13" x1="821.48" y1="1011.65" x2="846.2" y2="890.22"/>
        <line class="cls-13" x1="825.56" y1="1013.37" x2="887.48" y2="903.02"/>
        <line class="cls-13" x1="827.72" y1="1014.23" x2="941" y2="875.93"/>
        <line class="cls-13" x1="829.88" y1="1016.22" x2="984.44" y2="897.46"/>
        <line class="cls-13" x1="832.04" y1="1019.05" x2="967.46" y2="938.6"/>
        <line class="cls-13" x1="833.84" y1="1019.73" x2="982.04" y2="971.18"/>
        <line class="cls-13" x1="837.56" y1="1020.75" x2="944.12" y2="1002.83"/>
        <line class="cls-13" x1="837.56" y1="1029.33" x2="936.92" y2="1048.04"/>
        <line class="cls-13" x1="833.84" y1="1034.12" x2="945.08" y2="1093.92"/>
        <line class="cls-13" x1="832.04" y1="1036.25" x2="947.62" y2="1136.36"/>
        <line class="cls-13" x1="827.96" y1="1037.02" x2="909.08" y2="1144.43"/>
        <line class="cls-13" x1="825.32" y1="1039.88" x2="859.4" y2="1115.16"/>
        <line class="cls-13" x1="820.52" y1="1039.79" x2="847.64" y2="1182.67"/>
        <line class="cls-13" x1="818.96" y1="1039.88" x2="817.27" y2="1138.83"/>
        <line class="cls-13" x1="865.33" y1="1115.08" x2="817.27" y2="1138.83"/>
        <line class="cls-13" x1="801.38" y1="1017.85" x2="643.76" y2="951.56"/>
        <line class="cls-13" x1="926.19" y1="731.68" x2="823.4" y2="1011.65"/>
        <line class="cls-13" x1="763.64" y1="936.74" x2="737.18" y2="903.02"/>
        <line class="cls-13" x1="763.64" y1="936.74" x2="741.08" y2="865.81"/>
        <line class="cls-13" x1="703.03" y1="923.14" x2="678.53" y2="903.78"/>
        <line class="cls-13" x1="727.09" y1="886.49" x2="736.05" y2="901.18"/>
        <line class="cls-13" x1="662.17" y1="976.64" x2="643.76" y2="951.56"/>
        <line class="cls-13" x1="661.79" y1="1034.12" x2="648.38" y2="1070"/>
        <line class="cls-13" x1="695.4" y1="1066.64" x2="650.78" y2="1067.69"/>
        <line class="cls-13" x1="921.48" y1="1151.32" x2="943.54" y2="1146.42"/>
        <line class="cls-13" x1="922.52" y1="1162.27" x2="944.84" y2="1191.48"/>
        <line class="cls-13" x1="994.31" y1="1186.04" x2="947.19" y2="1193.24"/>
        <line class="cls-13" x1="994.31" y1="1186.04" x2="959.72" y2="1147.4"/>
        <line class="cls-13" x1="948.44" y1="1056.44" x2="959.72" y2="1147.4"/>
      </g>
    </g>
    <g id="miedo">
      <g id="miedo_nivel_uno">
        <circle id="miedo_miedo_nivel_uno_ca" class="cls-18" cx="553.32" cy="1286.9" r="177.97"/>
        <circle id="miedo_miedo_nivel_uno_cb" class="cls-13" cx="553.32" cy="1286.9" r="20.88"/>
      </g>
      <g id="miedo_nivel_dos">
        <g>
          <circle id="panico_miedo_nivel_dos_ca" class="cls-18" cx="631.68" cy="1335.32" r="67.49"/>
          <circle id="panico_miedo_nivel_dos_cb" class="cls-13" cx="631.68" cy="1334.35" r="12.86"/>
        </g>
        <g id="horror_miedo">
          <circle id="horror_miedo_nivel_dos_ca" class="cls-18" cx="599.96" cy="1368.95" r="67.49"/>
          <circle id="horror_miedo_nivel_dos_cb" class="cls-13" cx="599.96" cy="1367.97" r="12.86"/>
        </g>
        <g id="terror_miedo">
          <circle id="terror_miedo_nivel_dos_ca" class="cls-18" cx="532.44" cy="1378.77" r="67.49"/>
          <circle id="terror_miedo_nivel_dos_cb" class="cls-13" cx="533.04" cy="1376.6" r="12.86"/>
        </g>
        <g id="temor_miedo">
          <circle id="temor_miedo_nivel_dos_ca" class="cls-18" cx="475.61" cy="1331.77" r="67.49"/>
          <circle id="temor_miedo_nivel_dos_cb" class="cls-13" cx="475.61" cy="1330.8" r="12.86"/>
        </g>
        <g id="fobia_miedo">
          <circle id="fobia_miedo_nivel_dos_ca" class="cls-18" cx="413.38" cy="1186.14" r="67.49"/>
          <circle id="fobia_miedo_nivel_dos_cb" class="cls-13" cx="415.03" cy="1184.74" r="12.86"/>
        </g>
        <g id="alarma_miedo">
          <circle id="alarma_miedo_nivel_dos_ca" class="cls-18" cx="433.13" cy="1150.9" r="67.49"/>
          <circle id="alarma_miedo_nivel_dos_cb" class="cls-13" cx="433.13" cy="1149.93" r="12.86"/>
        </g>
        <g id="susto_miedo">
          <circle id="susto_miedo_nivel_dos_ca" class="cls-18" cx="566.04" cy="1169.23" r="67.49"/>
          <circle id="susto_miedo_nivel_dos_cb" class="cls-13" cx="566.04" cy="1168.26" r="12.86"/>
        </g>
      </g>
      <g id="miedo_nivel_tres">
        <circle id="desasociego_miedo_nivel_tres_ca" class="cls-18" cx="695.78" cy="1242.04" r="27.17"/>
        <circle id="desasociego_miedo_nivel_tres_cb" class="cls-13" cx="695.78" cy="1241.5" r="7.16"/>
      </g>
      <g id="miedo_nivel_cuatro">
        <g id="desasociego_miedo">
          <circle id="desasociego_miedo_nivel_cuatro_ca" class="cls-18" cx="385.58" cy="1284.82" r="18.8"/>
          <circle id="desasociego_miedo_nivel_cuatro_cb" class="cls-13" cx="385.58" cy="1285.66" r="5.28"/>
        </g>
        <g id="xenofobia_miedo">
          <circle id="xenofobia_miedo_nivel_cuatro_ca" class="cls-18" cx="377.54" cy="1226.66" r="18.8"/>
          <circle id="xenofobia_miedo_nivel_cuatro_cb" class="cls-13" cx="377.54" cy="1227.5" r="5.28"/>
        </g>
        <g id="homofobia_miedo">
          <circle id="homofobia_miedo_nivel_cuatro_ca" class="cls-18" cx="364.68" cy="1194.44" r="18.8"/>
          <circle id="homofobia_miedo_nivel_cuatro_cb" class="cls-13" cx="364.68" cy="1195.28" r="5.28"/>
        </g>
        <g id="intranquilidad_miedo">
          <circle id="intranquilidad_miedo_nivel_cuatro_ca" class="cls-18" cx="509" cy="1176.32" r="18.8"/>
          <circle id="intranquilidad_miedo_nivel_cuatro_cb" class="cls-13" cx="509" cy="1177.16" r="5.28"/>
        </g>
        <g id="vulnerabilidad_miedo">
          <circle id="vulnerabilidad_miedo_nivel_cuatro_ca" class="cls-18" cx="520.37" cy="1202.12" r="18.8"/>
          <circle id="vulnerabilidad_miedo_nivel_cuatro_cb" class="cls-13" cx="520.37" cy="1202.96" r="5.28"/>
        </g>
        <g id="sobresalto_miedo">
          <circle id="sobresalto_miedo_nivel_cuatro_ca" class="cls-18" cx="606.08" cy="1135.01" r="18.8"/>
          <circle id="sobresalto_miedo_nivel_cuatro_cb" class="cls-13" cx="606.08" cy="1135.84" r="5.28"/>
        </g>
      </g>
      <g id="miedo_nivel_cinco">
        <g id="pavor_miedo">
          <circle id="pavor_miedo_nivel_cinco_ca" class="cls-18" cx="595.73" cy="1241.26" r="7.8"/>
          <circle id="pavor_miedo_nivel_cinco_cb" class="cls-13" cx="595.73" cy="1239.26" r="3"/>
        </g>
        <g id="canguelo_miedo">
          <circle id="canguelo_miedo_nivel_cinco_ca" class="cls-18" cx="472.23" cy="1395.9" r="7.8"/>
          <circle id="canguelo_miedo_nivel_cinco_cb" class="cls-13" cx="472.23" cy="1391.76" r="2.87"/>
        </g>
        <g id="sobrecogimiento_miedo">
          <circle id="sobrecogimiento_miedo_nivel_cinco_ca" class="cls-18" cx="549.92" cy="1124.23" r="7.8"/>
          <circle id="sobrecogimiento_miedo_nivel_cinco_cb" class="cls-13" cx="549.92" cy="1122.52" r="3"/>
        </g>
        <g id="coaccion_miedo">
          <circle id="coaccion_miedo_nivel_cinco_ca" class="cls-18" cx="659.42" cy="1211.03" r="7.8"/>
          <circle id="coaccion_miedo_nivel_cinco_cb" class="cls-13" cx="659.42" cy="1208.37" r="3"/>
        </g>
      </g>
      <g id="miedo_lineas">
        <line class="cls-13" x1="624.88" y1="1329.23" x2="566.36" y2="1296.2"/>
        <line class="cls-13" x1="595.62" y1="1361" x2="559.64" y2="1300.28"/>
        <line class="cls-13" x1="535.64" y1="1366.91" x2="548.36" y2="1303.16"/>
        <line class="cls-13" x1="485" y1="1325.58" x2="537.56" y2="1294.65"/>
        <line class="cls-13" x1="423.08" y1="1192.07" x2="537.56" y2="1276.57"/>
        <line class="cls-13" x1="416.84" y1="1195.28" x2="470.61" y2="1321.49"/>
        <line class="cls-13" x1="525.65" y1="1370.51" x2="483.56" y2="1338.35"/>
        <line class="cls-13" x1="543.11" y1="1375.64" x2="590.84" y2="1370.51"/>
        <line class="cls-13" x1="623.72" y1="1342.85" x2="607.64" y2="1361"/>
        <line class="cls-13" x1="630.92" y1="1323.08" x2="629.48" y2="1260.35"/>
        <line class="cls-13" x1="572.36" y1="1177.16" x2="620.6" y2="1239.26"/>
        <line class="cls-13" x1="439.88" y1="1157.53" x2="540.98" y2="1274.12"/>
        <line class="cls-13" x1="564.18" y1="1177.16" x2="555.23" y2="1273.16"/>
        <line class="cls-13" x1="556.76" y1="1167.22" x2="444.32" y2="1152.14"/>
        <line class="cls-13" x1="618.33" y1="1253.64" x2="569.96" y2="1279.31"/>
      </g>
    </g>
    <g id="asco">
      <g id="asco_nivel_uno_tx">
        <circle id="asco_asco_nivel_uno_ca" class="cls-12" cx="281.02" cy="1335.92" r="89.64"/>
        <circle id="asco_asco_nivel_uno_cb" class="cls-13" cx="281.02" cy="1333.54" r="16.9"/>
      </g>
      <g id="asco_nivel_tres_tx">
        <g id="repugnancia_asco">
          <circle id="repugnancia_asco_nivel_cuatro_ca" class="cls-12" cx="249.52" cy="1386.16" r="25.88"/>
          <circle id="repugnancia_asco_nivel_cuatro_cb" class="cls-13" cx="248.38" cy="1386.16" r="6.94"/>
        </g>
        <g id="aversion_asco">
          <circle id="aversion_asco_nivel_cuatro_ca" class="cls-12" cx="252.22" cy="1280.38" r="25.88"/>
          <circle id="aversion_asco_nivel_cuatro_cb" class="cls-13" cx="251.08" cy="1280.38" r="6.94"/>
        </g>
        <g id="rechazo_asco">
          <circle id="rechazo_asco_nivel_cuatro_ca" class="cls-12" cx="320.21" cy="1278.64" r="25.88"/>
          <circle id="rechazo_asco_nivel_cuatro_cb" class="cls-13" cx="319.07" cy="1278.64" r="6.94"/>
        </g>
      </g>
      <g id="asco_nivel_cuatro_tx">
        <g id="repulsion_asco">
          <circle id="repulsion_asco_nivel_cuatro_ca" class="cls-12" cx="335.21" cy="1371.1" r="17"/>
          <circle id="repulsion_asco_nivel_cuatro_cb" class="cls-13" cx="334.46" cy="1371.1" r="5.5"/>
        </g>
        <g id="nausea_asco">
          <circle id="nausea_asco_nivel_cuatro_ca" class="cls-12" cx="266.51" cy="1413.8" r="17"/>
          <circle id="nausea_asco_nivel_cuatro_cb" class="cls-13" cx="265.77" cy="1413.8" r="5.5"/>
        </g>
      </g>
      <g id="asco_nivel_cinco_tx">
        <g id="desagrado_asco">
          <circle id="desagrado_asco_nivel_cinco_ca" class="cls-12" cx="222.48" cy="1352.64" r="11.47"/>
          <circle id="desagrado_asco_nivel_cinco_cb" class="cls-13" cx="222.48" cy="1352.72" r="3.63"/>
        </g>
        <g id="aprension_asco">
          <circle id="aprension_asco_nivel_cinco_ca" class="cls-12" cx="218.85" cy="1304.49" r="11.47"/>
          <circle id="aprension_asco_nivel_cinco_cb" class="cls-13" cx="219.83" cy="1304.58" r="3.63"/>
        </g>
        <g id="repelus_asco">
          <circle id="repelus_asco_nivel_cinco_ca" class="cls-12" cx="346.09" cy="1335.03" r="11.47"/>
          <circle id="repelus_asco_nivel_cinco_cb" class="cls-13" cx="345.88" cy="1335.92" r="3.63"/>
        </g>
      </g>
      <g id="asco_lineas">
        <line class="cls-13" x1="289.26" y1="1325.58" x2="319.07" y2="1278.64"/>
        <line class="cls-13" x1="273.32" y1="1321.34" x2="253.52" y2="1283.9"/>
        <line class="cls-13" x1="273.32" y1="1346.17" x2="249.52" y2="1384.16"/>
        <line class="cls-13" x1="294.33" y1="1343.3" x2="331.39" y2="1369.04"/>
        <line class="cls-13" x1="292.22" y1="1331.15" x2="452.42" y2="1303.62"/>
      </g>
    </g>
    <g id="ira">
      <g id="ira_nivel_uno">
        <circle id="ira_ira_nivel_uno_tx" class="cls-7" cx="291.69" cy="1027.04" r="178.92"/>
        <circle id="ira_ira_nivel_uno_tx-2" data-name="ira_ira_nivel_uno_tx" class="cls-13" cx="289.26" cy="1024.61" r="20.24"/>
        <text id="ira_ira_nivel_uno_tx-3" data-name="ira_ira_nivel_uno_tx" class="cls-19" transform="translate(239.45 1033.62)"><tspan x="0" y="0">IR</tspan><tspan class="cls-57" x="11" y="0">A</tspan></text>
      </g>
      <g id="ira_nivel_dos">
        <g id="agresividad_ira">
          <circle id="agresividad_ira_nivel_dos_ca" class="cls-7" cx="269.02" cy="1163.62" r="66.78"/>
          <circle id="agresividad_ira_nivel_dos_cb" class="cls-13" cx="269.59" cy="1161.46" r="13.39"/>
        </g>
        <g id="hostilidad_ira">
          <circle id="hostilidad_ira_nivel_dos_ca" class="cls-7" cx="238.29" cy="1140.05" r="66.78"/>
          <circle id="hostilidad_ira_nivel_dos_cb" class="cls-13" cx="234.65" cy="1137.8" r="13.39"/>
        </g>
        <g id="odio_ira">
          <circle id="odio_ira_nivel_dos_ca" class="cls-7" cx="189.42" cy="1101.52" r="66.78"/>
          <circle id="odio_ira_nivel_dos_cb" class="cls-13" cx="188.86" cy="1099.1" r="13.39"/>
        </g>
        <g id="rencor_ira">
          <circle id="rencor_ira_nivel_dos_ca" class="cls-7" cx="213.43" cy="1057.63" r="66.78"/>
          <circle id="rencor_ira_nivel_dos_cb" class="cls-13" cx="213.43" cy="1057.63" r="13.39"/>
        </g>
        <g id="furia_ira">
          <circle id="furia_ira_nivel_dos_ca" class="cls-7" cx="151.47" cy="1015.76" r="66.78"/>
          <circle id="furia_ira_nivel_dos_cb" class="cls-13" cx="151.47" cy="1014.07" r="13.39"/>
        </g>
        <g id="colera_ira">
          <circle id="colera_ira_nivel_dos_ca" class="cls-7" cx="141.39" cy="981.81" r="66.78"/>
          <circle id="colera_ira_nivel_dos_cb" class="cls-13" cx="141.39" cy="981.81" r="13.39"/>
        </g>
        <g id="enfado_ira">
          <circle id="enfado_ira_nivel_dos_ca" class="cls-7" cx="152.68" cy="944.7" r="63.5"/>
          <circle id="enfado_ira_nivel_dos_cb" class="cls-13" cx="151.47" cy="946.61" r="13.39"/>
        </g>
        <g id="rabia_ira">
          <circle id="rabia_ira_nivel_dos_ca" class="cls-7" cx="179.86" cy="920.26" r="63.5"/>
          <circle id="rabia_ira_nivel_dos_cb" class="cls-13" cx="181.14" cy="923.93" r="13.39"/>
        </g>
        <g id="indignacion_ira">
          <circle id="indignacion_ira_nivel_dos_ca" class="cls-7" cx="231.7" cy="932.39" r="63.5"/>
          <circle id="indignacion_ira_nivel_dos_cb" class="cls-13" cx="235.92" cy="928.61" r="13.39"/>
        </g>
        <g id="impotencia_ira">
          <circle id="impotencia_ira_nivel_dos_ca" class="cls-7" cx="260.92" cy="912.58" r="63.5"/>
          <circle id="impotencia_ira_nivel_dos_cb" class="cls-13" cx="265.73" cy="914.14" r="13.39"/>
        </g>
        <g id="celos_ira">
          <circle id="celos_ira_nivel_dos_ca" class="cls-7" cx="293.96" cy="856.01" r="63.5"/>
          <circle id="celos_ira_nivel_dos_cb" class="cls-13" cx="296.11" cy="857.88" r="13.39"/>
        </g>
        <g id="envidia_ira">
          <circle id="envidia_ira_nivel_dos_ca" class="cls-7" cx="327.18" cy="856.01" r="63.5"/>
          <circle id="envidia_ira_nivel_dos_cb" class="cls-13" cx="329.59" cy="860.13" r="13.39"/>
        </g>
        <g id="antipatia_ira">
          <circle id="antipatia_ira_nivel_dos_ca" class="cls-7" cx="387.52" cy="906" r="64.94"/>
          <circle id="antipatia_ira_nivel_dos_cb" class="cls-13" cx="390.68" cy="906.47" r="13.39"/>
        </g>
        <g id="malhumor_ira">
          <circle id="malhumor_ira_nivel_dos_ca" class="cls-7" cx="425.98" cy="959" r="65.7"/>
          <circle id="malhumor_ira_nivel_dos_cb" class="cls-13" cx="425.98" cy="957.34" r="13.39"/>
        </g>
        <g id="fastidio_ira">
          <circle id="fastidio_ira_nivel_dos_ca" class="cls-7" cx="424.21" cy="1002.86" r="67.47"/>
          <circle id="fastidio_ira_nivel_dos_cb" class="cls-13" cx="422.53" cy="1002.86" r="13.39"/>
        </g>
        <g id="resentimiento_ira">
          <circle id="resentimiento_ira_nivel_dos_ca" class="cls-7" cx="422.53" cy="1045.71" r="66.78"/>
          <circle id="resentimiento_ira_nivel_dos_cb" class="cls-13" cx="422.53" cy="1044.24" r="13.39"/>
        </g>
      </g>
      <g id="ira_nivel_tres">
        <g id="tension_ira">
          <circle id="tension_ira_nivel_tres_ca" class="cls-7" cx="310.13" cy="1121.37" r="25.67"/>
          <circle id="tension_ira_nivel_tres_cb" class="cls-13" cx="311.03" cy="1121.37" r="7.25"/>
        </g>
        <g id="agitacion_ira">
          <circle id="agitacion_ira_nivel_tres_ca" class="cls-7" cx="320.21" cy="1189.3" r="25.67"/>
          <circle id="agitacion_ira_nivel_tres_cb" class="cls-13" cx="320.21" cy="1188.09" r="7.25"/>
        </g>
        <g id="actitud_ira">
          <circle id="actitud_ira_nivel_tres_ca" class="cls-7" cx="271.78" cy="1214.97" r="25.67"/>
          <circle id="actitud_ira_nivel_tres_cb" class="cls-13" cx="269.02" cy="1212.86" r="7.25"/>
        </g>
        <g id="violencia_ira">
          <circle id="violencia_ira_nivel_tres_ca" class="cls-7" cx="226.81" cy="1214.97" r="25.67"/>
          <circle id="violencia_ira_nivel_tres_cb" class="cls-13" cx="225.51" cy="1215.98" r="7.25"/>
        </g>
        <g id="exasperacion_ira">
          <circle id="exasperacion_ira_nivel_tres_ca" class="cls-7" cx="120.97" cy="1053.02" r="25.67"/>
          <circle id="exasperacion_ira_nivel_tres_cb" class="cls-13" cx="123.61" cy="1054.17" r="7.25"/>
        </g>
        <g id="desconfianza_ira">
          <circle id="desconfianza_ira_nivel_tres_ca" class="cls-7" cx="213.43" cy="840.43" r="25.67"/>
          <circle id="desconfianza_ira_nivel_tres_cb" class="cls-13" cx="213.43" cy="840.43" r="7.25"/>
        </g>
        <g id="impaciencia_ira">
          <circle id="impaciencia_ira_nivel_tres_ca" class="cls-7" cx="322.52" cy="815.64" r="25.67"/>
          <circle id="impaciencia_ira_nivel_tres_cb" class="cls-13" cx="319.37" cy="817.84" r="7.25"/>
        </g>
        <g id="desamor_ira">
          <circle id="desamor_ira_nivel_tres_ca" class="cls-7" cx="395.5" cy="837.5" r="25.67"/>
          <circle id="desamor_ira_nivel_tres_cb" class="cls-13" cx="393.99" cy="837.5" r="7.25"/>
        </g>
        <g id="despecho_ira">
          <circle id="despecho_ira_nivel_tres_ca" class="cls-7" cx="413.96" cy="879.18" r="25.67"/>
          <circle id="despecho_ira_nivel_tres_cb" class="cls-13" cx="412.59" cy="879.18" r="7.25"/>
        </g>
        <g id="desprecio_ira">
          <circle id="desprecio_ira_nivel_tres_ca" class="cls-7" cx="432.34" cy="898.2" r="25.67"/>
          <circle id="desprecio_ira_nivel_tres_cb" class="cls-13" cx="430.5" cy="898.2" r="7.25"/>
        </g>
      </g>
      <g id="ira_nivel_cuatro">
        <g id="enojo_ira">
          <circle id="enojo_ira_nivel_cuatro_ca" class="cls-7" cx="171.51" cy="975.1" r="18.24"/>
          <circle id="enojo_ira_nivel_cuatro_cb" class="cls-13" cx="171.19" cy="973.6" r="5.73"/>
        </g>
        <g id="furor_ira">
          <circle id="furor_ira_nivel_cuatro_ca" class="cls-7" cx="95.6" cy="1024.68" r="18.24"/>
          <circle id="furor_ira_nivel_cuatro_cb" class="cls-13" cx="95.6" cy="1024.68" r="5.73"/>
        </g>
        <g id="irritacion_ira">
          <circle id="irritacion_ira_nivel_cuatro_ca" class="cls-7" cx="77.37" cy="990.85" r="18.24"/>
          <circle id="irritacion_ira_nivel_cuatro_cb" class="cls-13" cx="76.16" cy="989.48" r="5.73"/>
        </g>
        <g id="excitacion_ira">
          <circle id="excitacion_ira_nivel_cuatro_ca" class="cls-7" cx="120.97" cy="912.7" r="18.24"/>
          <circle id="excitacion_ira_nivel_cuatro_cb" class="cls-13" cx="119.57" cy="914.14" r="5.73"/>
        </g>
        <g id="recelo_ira">
          <circle id="recelo_ira_nivel_cuatro_ca" class="cls-7" cx="240.16" cy="809.14" r="18.24"/>
          <circle id="recelo_ira_nivel_cuatro_cb" class="cls-13" cx="240.16" cy="809.14" r="5.73"/>
        </g>
        <g id="enemistad_ira">
          <circle id="enemistad_ira_nivel_cuatro_ca" class="cls-7" cx="336.25" cy="930.94" r="18.24"/>
          <circle id="enemistad_ira_nivel_cuatro_cb" class="cls-13" cx="336.56" cy="932.39" r="5.73"/>
        </g>
        <g id="animadversion_ira">
          <circle id="animadversion_ira_nivel_cuatro_ca" class="cls-7" cx="326.62" cy="953.56" r="18.24"/>
          <circle id="animadversion_ira_nivel_cuatro_cb" class="cls-13" cx="326.62" cy="955.35" r="5.73"/>
        </g>
        <g id="indiferencia_ira">
          <circle id="indiferencia_ira_nivel_cuatro_ca" class="cls-7" cx="455.12" cy="1077.1" r="18.24"/>
          <circle id="indiferencia_ira_nivel_cuatro_cb" class="cls-13" cx="455.12" cy="1077.1" r="5.73"/>
        </g>
        <g id="frialdad_ira">
          <circle id="frialdad_ira_nivel_cuatro_ca" class="cls-7" cx="418.97" cy="1088.48" r="18.24"/>
          <circle id="frialdad_ira_nivel_cuatro_cb" class="cls-13" cx="418.97" cy="1087.04" r="5.73"/>
        </g>
        <g id="racismo_ira">
          <circle id="racismo_ira_nivel_cuatro_ca" class="cls-7" cx="382.38" cy="1115.39" r="18.24"/>
          <circle id="racismo_ira_nivel_cuatro_cb" class="cls-13" cx="382.38" cy="1115.67" r="5.73"/>
        </g>
        <g id="sexismo_ira">
          <circle id="sexismo_ira_nivel_cuatro_ca" class="cls-7" cx="358.35" cy="1133.9" r="18.24"/>
          <circle id="sexismo_ira_nivel_cuatro_cb" class="cls-13" cx="356.74" cy="1135.11" r="5.73"/>
        </g>
        <g id="misoginia_ira">
          <circle id="misoginia_ira_nivel_cuatro_ca" class="cls-7" cx="350.67" cy="1163.62" r="18.24"/>
          <circle id="misoginia_ira_nivel_cuatro_cb" class="cls-13" cx="350.67" cy="1163.62" r="5.73"/>
        </g>
      </g>
      <g id="ira_nivel_cinco">
        <g id="sadismo_ira">
          <circle id="sadismo_ira_nivel_cinco_ca" class="cls-7" cx="307.23" cy="1156.69" r="7.25"/>
          <circle id="sadismo_ira_nivel_cinco_cb" class="cls-13" cx="307.23" cy="1153.8" r="2.9"/>
        </g>
        <g id="insensibilidad_ira">
          <circle id="insensibilidad_ira_nivel_cinco_ca" class="cls-7" cx="189.96" cy="1170.43" r="7.25"/>
          <circle id="insensibilidad_ira_nivel_cinco_cb" class="cls-13" cx="185.81" cy="1173.23" r="2.9"/>
        </g>
        <g id="crueldad_ira">
          <circle id="crueldad_ira_nivel_cinco_ca" class="cls-7" cx="194.49" cy="1180.52" r="7.25"/>
          <circle id="crueldad_ira_nivel_cinco_cb" class="cls-13" cx="191.6" cy="1181.86" r="2.9"/>
        </g>
        <g id="despiedad_ira">
          <circle id="despiedad_ira_nivel_cinco_ca" class="cls-7" cx="203.84" cy="1189.62" r="7.25"/>
          <circle id="despiedad_ira_nivel_cinco_cb" class="cls-13" cx="201.14" cy="1190.7" r="2.9"/>
        </g>
        <g id="aborrecimiento_ira">
          <circle id="aborrecimiento_ira_nivel_cinco_ca" class="cls-7" cx="164.93" cy="1118.65" r="7.25"/>
          <circle id="aborrecimiento_ira_nivel_cinco_cb" class="cls-13" cx="164.93" cy="1117.02" r="2.9"/>
        </g>
        <g id="excecracion_ira">
          <circle id="excecracion_ira_nivel_cinco_ca" class="cls-7" cx="223.07" cy="1097.7" r="7.25"/>
          <circle id="excecracion_ira_nivel_cinco_cb" class="cls-13" cx="223.07" cy="1095.7" r="2.9"/>
        </g>
        <g id="ojeriza_ira">
          <circle id="ojeriza_ira_nivel_cinco_ca" class="cls-7" cx="244.14" cy="1076.17" r="7.25"/>
          <circle id="ojeriza_ira_nivel_cinco_cb" class="cls-13" cx="244.06" cy="1073.27" r="2.9"/>
        </g>
        <g id="detestacion_ira">
          <circle id="detestacion_ira_nivel_cinco_ca" class="cls-7" cx="169.1" cy="1073.27" r="7.25"/>
          <circle id="detestacion_ira_nivel_cinco_cb" class="cls-13" cx="169.82" cy="1071.02" r="2.9"/>
        </g>
        <g id="encono_ira">
          <circle id="encono_ira_nivel_cinco_ca" class="cls-7" cx="205.12" cy="1030.39" r="7.25"/>
          <circle id="encono_ira_nivel_cinco_cb" class="cls-13" cx="206.93" cy="1028.95" r="2.9"/>
        </g>
        <g id="sana_ira">
          <circle id="sana_ira_nivel_cinco_ca" class="cls-7" cx="158.12" cy="1037.64" r="7.25"/>
          <circle id="sana_ira_nivel_cinco_cb" class="cls-13" cx="158.12" cy="1034.74" r="2.9"/>
        </g>
        <g id="cabreo_ira">
          <circle id="cabreo_ira_nivel_cinco_ca" class="cls-7" cx="189.65" cy="949.51" r="7.25"/>
          <circle id="cabreo_ira_nivel_cinco_cb" class="cls-13" cx="189.65" cy="946.61" r="2.9"/>
        </g>
        <g id="vesania_ira">
          <circle id="vesania_ira_nivel_cinco_ca" class="cls-7" cx="98.5" cy="956.71" r="7.25"/>
          <circle id="vesania_ira_nivel_cinco_cb" class="cls-13" cx="98.5" cy="953.81" r="2.9"/>
        </g>
        <g id="mania_ira">
          <circle id="mania_ira_nivel_cinco_ca" class="cls-7" cx="149.31" cy="892.95" r="7.25"/>
          <circle id="mania_ira_nivel_cinco_cb" class="cls-13" cx="148.92" cy="889.28" r="2.9"/>
        </g>
        <g id="escama_ira">
          <circle id="escama_ira_nivel_cinco_ca" class="cls-7" cx="174.39" cy="870.01" r="7.25"/>
          <circle id="escama_ira_nivel_cinco_cb" class="cls-13" cx="174.39" cy="867.55" r="2.9"/>
        </g>
        <g id="sospecha_ira">
          <circle id="sospecha_ira_nivel_cinco_ca" class="cls-7" cx="207.82" cy="853.39" r="7.25"/>
          <circle id="sospecha_ira_nivel_cinco_cb" class="cls-13" cx="208.17" cy="852.22" r="2.9"/>
        </g>
        <g id="pelusa_ira">
          <circle id="pelusa_ira_nivel_cinco_ca" class="cls-7" cx="278.72" cy="829.67" r="7.25"/>
          <circle id="pelusa_ira_nivel_cinco_cb" class="cls-13" cx="278.76" cy="827.53" r="2.9"/>
        </g>
        <g id="desapego_ira">
          <circle id="desapego_ira_nivel_cinco_ca" class="cls-7" cx="353.01" cy="829.67" r="7.25"/>
          <circle id="desapego_ira_nivel_cinco_cb" class="cls-13" cx="353.01" cy="829.17" r="2.9"/>
        </g>
        <g id="desafecto_ira">
          <circle id="desafecto_ira_nivel_cinco_ca" class="cls-7" cx="366.28" cy="810.59" r="7.25"/>
          <circle id="desafecto_ira_nivel_cinco_cb" class="cls-13" cx="366.28" cy="810.59" r="2.9"/>
        </g>
        <g id="desorden_ira">
          <circle id="desorden_ira_nivel_cinco_ca" class="cls-7" cx="439.64" cy="877.25" r="7.25"/>
          <circle id="desorden_ira_nivel_cinco_cb" class="cls-13" cx="439.64" cy="875.68" r="2.9"/>
        </g>
        <g id="displicencia_ira">
          <circle id="displicencia_ira_nivel_cinco_ca" class="cls-7" cx="460.91" cy="926.48" r="7.25"/>
          <circle id="displicencia_ira_nivel_cinco_cb" class="cls-13" cx="460.91" cy="923.58" r="2.9"/>
        </g>
        <g id="resquemor_ira">
          <circle id="resquemor_ira_nivel_cinco_ca" class="cls-7" cx="385.66" cy="1058.37" r="7.25"/>
          <circle id="resquemor_ira_nivel_cinco_cb" class="cls-13" cx="385.66" cy="1055.48" r="2.9"/>
        </g>
      </g>
      <g id="ira_lineas">
        <line class="cls-13" x1="416.84" y1="961.96" x2="304.28" y2="1017.85"/>
        <line class="cls-13" x1="420.92" y1="1003.81" x2="308.39" y2="1022.89"/>
        <line class="cls-13" x1="422.53" y1="1044.24" x2="306.92" y2="1028.12"/>
        <line class="cls-13" x1="424.21" y1="1143.74" x2="303.78" y2="1037.2"/>
        <line class="cls-13" x1="411.56" y1="1180.84" x2="297.45" y2="1037.2"/>
        <line class="cls-13" x1="280.21" y1="1322.6" x2="289.26" y2="1038.69"/>
        <line class="cls-13" x1="271.78" y1="1151.18" x2="286.46" y2="1038.69"/>
        <line class="cls-13" x1="240.2" y1="1129.38" x2="282.98" y2="1036.18"/>
        <line class="cls-13" x1="192.24" y1="1098.59" x2="279.12" y2="1033.62"/>
        <line class="cls-13" x1="218.25" y1="1054.32" x2="277.64" y2="1028.95"/>
        <line class="cls-13" x1="161.01" y1="1016.25" x2="277.64" y2="1024.61"/>
        <line class="cls-13" x1="150.79" y1="985.21" x2="277.64" y2="1021.4"/>
        <line class="cls-13" x1="158.97" y1="950.92" x2="276.2" y2="1017.85"/>
        <line class="cls-13" x1="186.73" y1="929.96" x2="279.12" y2="1015.1"/>
        <line class="cls-13" x1="239.72" y1="935.39" x2="282.98" y2="1015.1"/>
        <line class="cls-13" x1="266.6" y1="923.87" x2="286.46" y2="1014.07"/>
        <line class="cls-13" x1="295.2" y1="867.14" x2="289.26" y2="1013.35"/>
        <line class="cls-13" x1="318.01" y1="821.55" x2="290.84" y2="1013.35"/>
        <line class="cls-13" x1="217.58" y1="839.94" x2="286.46" y2="855.11"/>
        <line class="cls-13" x1="191.72" y1="924.68" x2="222.54" y2="928.61"/>
        <line class="cls-13" x1="158.12" y1="956.76" x2="169.72" y2="969.93"/>
        <line class="cls-13" x1="152.68" y1="979.33" x2="170.04" y2="975.24"/>
        <line class="cls-13" x1="128.83" y1="983.76" x2="78.2" y2="989.48"/>
        <line class="cls-13" x1="141.39" y1="1010.36" x2="78.2" y2="990.85"/>
        <line class="cls-13" x1="147.28" y1="1017.95" x2="125.29" y2="1052.58"/>
        <line class="cls-13" x1="261.77" y1="1168.3" x2="226.81" y2="1214.97"/>
        <line class="cls-13" x1="269.02" y1="1171.04" x2="268.1" y2="1211"/>
        <line class="cls-13" x1="336.25" y1="865.24" x2="385.66" y2="902.53"/>
        <line class="cls-13" x1="393.99" y1="841.94" x2="390.68" y2="900.75"/>
        <line class="cls-13" x1="413.96" y1="881.2" x2="430.5" y2="895.45"/>
        <line class="cls-13" x1="300.68" y1="1013.35" x2="429.19" y2="900.42"/>
        <line class="cls-13" x1="301.88" y1="1021.4" x2="635.26" y2="953.47"/>
        <line class="cls-13" x1="340.89" y1="929.67" x2="381.39" y2="912.21"/>
        <line class="cls-13" x1="327.18" y1="868.89" x2="292.23" y2="1013.35"/>
        <line class="cls-13" x1="385.66" y1="914.14" x2="296.11" y2="1016.25"/>
        <line class="cls-13" x1="158.97" y1="1020.43" x2="204.04" y2="1052.58"/>
      </g>
    </g>
    <g id="ansiedad">
      <g id="ansiedad_nivel_uno">
        <circle id="Ansiedad_Nivel_01_-_CA" data-name="Ansiedad Nivel 01 - CA" class="cls-20" cx="749.99" cy="1329.23" r="89.97"/>
        <circle id="Ansiedad_Nivel_01_-_CB" data-name="Ansiedad Nivel 01 - CB" class="cls-13" cx="749.99" cy="1329.23" r="16.46"/>
      </g>
      <g id="estres_nivel_uno">
        <path id="Depresión_Nivel_01_-_CA" data-name="Depresión Nivel 01 - CA" class="cls-20" d="M891.68,1256.06c-2.02,118.46-178.23,118.44-180.24,0,2.02-118.46,178.23-118.44,180.24,0Z"/>
        <circle id="Estrés_Nivel_01_-_CB" data-name="Estrés Nivel 01 - CB" class="cls-13" cx="804.06" cy="1255.73" r="16.46"/>
      </g>
      <g id="angustia_nivel_uno">
        <circle id="Angustia_Nivel_01_-_CA" data-name="Angustia Nivel 01 - CA" class="cls-20" cx="696.2" cy="1402.04" r="66.72"/>
        <circle id="Angustia_Nivel_01_-_CB" data-name="Angustia Nivel 01 - CB" class="cls-13" cx="695.12" cy="1401.14" r="13.44"/>
      </g>
      <g id="desesperacion_nivel_uno">
        <circle id="Desesperación_Nivel_01_-_CA" data-name="Desesperación Nivel 01 - CA" class="cls-20" cx="771.08" cy="1389.8" r="66.72"/>
        <circle id="Desesperación_Nivel_01_-_CB" data-name="Desesperación Nivel 01 - CB" class="cls-13" cx="771.68" cy="1388.6" r="13.44"/>
      </g>
      <g id="preocupacion_nivel_uno">
        <circle id="Preocupación_Nivel_01_-_CA" data-name="Preocupación Nivel 01 - CA" class="cls-20" cx="833.17" cy="1361" r="66.72"/>
        <circle id="Preocupación_Nivel_01_-_CB" data-name="Preocupación Nivel 01 - CB" class="cls-13" cx="833.17" cy="1361" r="13.44"/>
      </g>
      <g id="ansiedad_nivel_tres">
        <g>
          <circle id="Nerviosismo_Nivel_02_-_CA" data-name="Nerviosismo Nivel 02 - CA" class="cls-20" cx="745.18" cy="1279.73" r="24.94"/>
          <circle id="Hipocondria_Nivel_02_-_CB" data-name="Hipocondria Nivel 02 - CB" class="cls-13" cx="746.96" cy="1280.18" r="6.72"/>
        </g>
        <g>
          <circle id="Hipocondria_Nivel_02_-_CA" data-name="Hipocondria Nivel 02 - CA" class="cls-20" cx="836" cy="1302.52" r="24.94"/>
          <circle id="Nerviosismo_Nivel_02_-_CB" data-name="Nerviosismo Nivel 02 - CB" class="cls-13" cx="837.22" cy="1303.83" r="6.72"/>
        </g>
        <g>
          <circle id="Inquietud_Nivel_02_-_CA" data-name="Inquietud Nivel 02 - CA" class="cls-20" cx="885.87" cy="1340.72" r="24.94"/>
          <circle id="Inquietud_Nivel_02_-_CB" data-name="Inquietud Nivel 02 - CB" class="cls-13" cx="885.87" cy="1340.72" r="6.72"/>
        </g>
        <g>
          <circle id="Desazón_Nivel_02_-_CA" data-name="Desazón Nivel 02 - CA" class="cls-20" cx="876.51" cy="1389.8" r="24.94"/>
          <circle id="Desazón_Nivel_02_-_CB" data-name="Desazón Nivel 02 - CB" class="cls-13" cx="874.23" cy="1390.76" r="6.72"/>
        </g>
        <g>
          <circle id="Inseguridad_Nivel_02_-_CA" data-name="Inseguridad Nivel 02 - CA" class="cls-20" cx="878.35" cy="1317.28" r="24.94"/>
          <circle id="Inseguridad_Nivel_02_-_CB" data-name="Inseguridad Nivel 02 - CB" class="cls-13" cx="878.35" cy="1317.99" r="6.72"/>
        </g>
      </g>
      <g id="ansiedad_nivel_cuatro">
        <g id="zozobra_ansiedad">
          <circle id="zozobra_ansiedad_nivel_cuatro_ca" class="cls-20" cx="854.43" cy="1423.9" r="17.21"/>
          <circle id="zozobra_ansiedad_nivel_cuatro_cb" class="cls-13" cx="853.56" cy="1423.9" r="5.57"/>
        </g>
        <g id="turbacion_ansiedad">
          <circle id="turbacion_ansiedad_nivel_cuatro_ca" class="cls-20" cx="818.77" cy="1423.9" r="17.21"/>
          <circle id="turbacion_ansiedad_nivel_cuatro_cb" class="cls-13" cx="819.54" cy="1423.53" r="5.57"/>
        </g>
        <g id="sindrome_abstinencia_ansiedad">
          <circle id="sindrome_abstinencia_ansiedad_nivel_cuatro_ca" class="cls-20" cx="661.82" cy="1447.66" r="17.21"/>
          <circle id="sindrome_abstinencia_ansiedad_nivel_cuatro_cb" class="cls-13" cx="661.19" cy="1449.18" r="5.57"/>
        </g>
      </g>
      <g id="ansiedad_nivel_cinco">
        <g id="escrupulo_ansiedad">
          <circle id="escrupulo_ansiedad_nivel_cinco_ca" class="cls-20" cx="786.8" cy="1356.03" r="7.47"/>
          <circle id="escrupulo_ansiedad_nivel_cinco_cb" class="cls-13" cx="786.8" cy="1353.53" r="3.09"/>
        </g>
        <g id="intriga_ansiedad">
          <circle id="intriga_ansiedad_nivel_cinco_ca" class="cls-20" cx="867.24" cy="1366.87" r="7.47"/>
          <circle id="intriga_ansiedad_nivel_cinco_cb" class="cls-13" cx="867.24" cy="1364.86" r="3.09"/>
        </g>
        <g id="apuro_ansiedad">
          <circle id="apuro_ansiedad_nivel_cinco_ca" class="cls-20" cx="835.26" cy="1397.24" r="7.47"/>
          <circle id="apuro_ansiedad_nivel_cinco_cb" class="cls-13" cx="835.26" cy="1396.18" r="3.09"/>
        </g>
      </g>
      <g id="ansiedad_lineas">
        <line class="cls-13" x1="842.36" y1="1207.93" x2="813.47" y2="1245.32"/>
        <line class="cls-13" x1="756.44" y1="1321.16" x2="796.3" y2="1268.15"/>
        <line class="cls-13" x1="741.3" y1="1276.57" x2="700.76" y2="1244.12"/>
        <line class="cls-13" x1="753.68" y1="1277.58" x2="793.16" y2="1261.11"/>
        <line class="cls-13" x1="833.17" y1="1350.44" x2="837.22" y2="1309.5"/>
        <line class="cls-13" x1="840.68" y1="1353.47" x2="874.43" y2="1321.52"/>
        <line class="cls-13" x1="843.92" y1="1356.71" x2="881.18" y2="1341.5"/>
        <line class="cls-13" x1="840.68" y1="1368.95" x2="869.3" y2="1388.6"/>
        <line class="cls-13" x1="762.38" y1="1336.82" x2="822.95" y2="1358.36"/>
        <line class="cls-13" x1="741.3" y1="1340.72" x2="700.76" y2="1393.09"/>
        <line class="cls-13" x1="754.46" y1="1342.85" x2="769.36" y2="1380.47"/>
        <line class="cls-13" x1="735.08" y1="1327.46" x2="569" y2="1291.55"/>
      </g>
    </g>
  </g>
</svg>`

/* ─────────────────────────────────────────────────────────────────────────── */

interface TooltipState {
  visible: boolean
  x: number
  y: number
  emotion: Emotion | null
  id: string
}

interface InfoPanelState {
  visible: boolean
  emotion: Emotion | null
  id: string
}

export default function UniversoEmociones() {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef       = useRef<SVGSVGElement | null>(null)
  const panZoomRef   = useRef<any>(null)

  const [tooltip, setTooltip]     = useState<TooltipState>({ visible: false, x: 0, y: 0, emotion: null, id: '' })
  const [infoPanel, setInfoPanel] = useState<InfoPanelState>({ visible: false, emotion: null, id: '' })
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [isMobile, setIsMobile]   = useState(false)
  const [mounted, setMounted]     = useState(false)

  /* ── INIT ─────────────────────────────────────────────────────────────── */
  useEffect(() => {
    setMounted(true)
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  /* ── TAG EMOTION GROUPS ───────────────────────────────────────────────── */
  useEffect(() => {
    if (!mounted) return
    const svg = document.getElementById('universo-svg') as SVGSVGElement | null
    if (!svg) return
    svgRef.current = svg

    Object.keys(EMOTIONS).forEach(id => {
      const el = document.getElementById(id)
      if (el) {
        el.setAttribute('data-emotion', id)
        el.setAttribute('data-cat', EMOTIONS[id].cat)
        el.setAttribute('role', 'button')
        el.setAttribute('tabindex', '0')
        el.setAttribute('aria-label', EMOTIONS[id].name)
        el.style.cursor = 'pointer'
        el.style.transformBox = 'fill-box'
        el.style.transformOrigin = 'center'
        el.style.transition = 'transform 0.25s cubic-bezier(0.4,0,0.2,1), opacity 0.3s'

      }
    })

    // Build label overlay — appended LAST to SVG so it renders above all circles
    const existingOverlay = document.getElementById('labels-overlay')
    if (existingOverlay) existingOverlay.remove()
    const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    overlay.id = 'labels-overlay'
    overlay.setAttribute('pointer-events', 'none')

    Object.keys(EMOTIONS).forEach(id => {
      const el = document.getElementById(id)
      if (!el || el.tagName !== 'g') return
      try {
        const bbox = (el as unknown as SVGGraphicsElement).getBBox()
        if (bbox.width < 8 || bbox.height < 8) return
        const emotion = EMOTIONS[id]
        const nivel = emotion.nivel
        if (nivel > 4) return // skip very tiny elements
        const cx = bbox.x + bbox.width / 2
        const cy = bbox.y + bbox.height / 2
        const fs = nivel <= 1 ? 11 : nivel === 2 ? 8 : nivel === 3 ? 7 : 6

        // Dark halo for readability
        const halo = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        halo.setAttribute('x', String(cx))
        halo.setAttribute('y', String(cy + fs * 0.38))
        halo.setAttribute('text-anchor', 'middle')
        halo.setAttribute('font-size', String(fs))
        halo.setAttribute('fill', 'none')
        halo.setAttribute('stroke', 'rgba(0,0,0,0.75)')
        halo.setAttribute('stroke-width', '2.5')
        halo.setAttribute('stroke-linejoin', 'round')
        halo.setAttribute('font-family', 'Raleway, sans-serif')
        halo.setAttribute('font-weight', nivel <= 2 ? '700' : '500')
        halo.setAttribute('data-cat', emotion.cat)
        halo.textContent = emotion.name
        overlay.appendChild(halo)

        // Actual text
        const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        txt.setAttribute('x', String(cx))
        txt.setAttribute('y', String(cy + fs * 0.38))
        txt.setAttribute('text-anchor', 'middle')
        txt.setAttribute('font-size', String(fs))
        txt.setAttribute('fill', '#ffffff')
        txt.setAttribute('font-family', 'Raleway, sans-serif')
        txt.setAttribute('font-weight', nivel <= 2 ? '700' : '500')
        txt.setAttribute('data-cat', emotion.cat)
        txt.textContent = emotion.name
        overlay.appendChild(txt)
      } catch (_) { /* getBBox unavailable */ }
    })

    svg.appendChild(overlay)

    // Entrance animation
    CAT_GROUPS.forEach((cat, i) => {
      const el = document.getElementById(cat)
      if (!el) return
      el.style.opacity = '0'
      el.style.transform = 'scale(0.85)'
      el.style.transformBox = 'fill-box'
      el.style.transformOrigin = 'center'
      el.style.transition = `opacity 0.8s ease ${i * 0.08}s, transform 0.8s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.08}s`
      setTimeout(() => {
        el.style.opacity = '1'
        el.style.transform = 'scale(1)'
      }, 100)
    })

    // Init svg-pan-zoom
    const initPZ = async () => {
      try {
        // Ensure SVG has explicit dimensions for svg-pan-zoom
        if (!svg.getAttribute('width')) {
          svg.setAttribute('width', '100%')
          svg.setAttribute('height', 'auto')
        }
        const mod = await import('svg-pan-zoom' as any)
        const svgPanZoom = mod.default ?? mod
        const pz = svgPanZoom(svg, {
          zoomEnabled: true,
          controlIconsEnabled: false,
          fit: true,
          center: true,
          minZoom: 0.2,
          maxZoom: 10,
          zoomScaleSensitivity: 0.25,
          dblClickZoomEnabled: true,
          mouseWheelZoomEnabled: true,
          preventMouseEventsDefault: false,
          onZoom: () => {},
        })
        panZoomRef.current = pz
      } catch (e) {
        console.warn('svg-pan-zoom not available:', e)
      }
    }
    setTimeout(initPZ, 500)
  }, [mounted])

  /* ── HIGHLIGHT CATEGORY ───────────────────────────────────────────────── */
  const highlightCategory = useCallback((cat: string | null) => {
    setActiveCategory(prev => {
      const next = prev === cat ? null : cat
      CAT_GROUPS.forEach(c => {
        const el = document.getElementById(c)
        if (el) el.style.opacity = !next || c === next ? '1' : '0.06'
        const lines = document.getElementById(c + '_lineas')
        if (lines) {
          lines.style.opacity = !next || c === next ? '1' : '0.02'
          if (next && c === next) {
            const color = CAT_COLORS[c] || '#fff'
            lines.querySelectorAll('line').forEach((l: Element) => {
              ;(l as SVGLineElement).style.stroke = color
              ;(l as SVGLineElement).style.strokeOpacity = '0.9'
              ;(l as SVGLineElement).style.filter = `drop-shadow(0 0 3px ${color})`
            })
          } else {
            lines.querySelectorAll('line').forEach((l: Element) => {
              ;(l as SVGLineElement).style.stroke = ''
              ;(l as SVGLineElement).style.strokeOpacity = ''
              ;(l as SVGLineElement).style.filter = ''
            })
          }
        }
      })
      // Filter label overlay by active category
      const overlay = document.getElementById('labels-overlay')
      if (overlay) {
        overlay.querySelectorAll('text[data-cat]').forEach((el: Element) => {
          const cat = el.getAttribute('data-cat')
          ;(el as SVGTextElement).style.opacity = !next || cat === next ? '1' : '0'
        })
      }
      // Scroll selected galaxy into view
      if (next) {
        setTimeout(() => {
          const el = document.getElementById(next)
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 50)
      }
      return next
    })
  }, [])

  /* ── SVG EVENT DELEGATION ─────────────────────────────────────────────── */
  const hoveredEmotionRef = useRef<HTMLElement | null>(null)

  const handleSVGMouseOver = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = (e.target as Element).closest('[data-emotion]') as HTMLElement | null

    // Reset previously hovered element if different
    if (hoveredEmotionRef.current && hoveredEmotionRef.current !== target) {
      const prev = hoveredEmotionRef.current
      prev.style.transform = 'scale(1)'
      const prevId = prev.getAttribute('data-emotion') || ''
      const prevEmotion = EMOTIONS[prevId]
      if (prevEmotion && !activeCategory) {
        const lines = document.getElementById(prevEmotion.cat + '_lineas')
        if (lines) lines.querySelectorAll('line').forEach((l: Element) => {
          ;(l as SVGLineElement).style.strokeOpacity = ''
          ;(l as SVGLineElement).style.filter = ''
        })
      }
    }

    hoveredEmotionRef.current = target
    if (!target) { setTooltip(prev => ({ ...prev, visible: false })); return }

    const id = target.getAttribute('data-emotion') || ''
    const emotion = EMOTIONS[id]
    if (!emotion) return

    target.style.transform = 'scale(1.18)'
    const color = CAT_COLORS[emotion.cat] || '#fff'
    const lines = document.getElementById(emotion.cat + '_lineas')
    if (lines) {
      lines.querySelectorAll('line').forEach((l: Element) => {
        ;(l as SVGLineElement).style.stroke = color
        ;(l as SVGLineElement).style.strokeOpacity = '1'
        ;(l as SVGLineElement).style.filter = `drop-shadow(0 0 3px ${color})`
      })
    }

    if (!isMobile) {
      setTooltip({ visible: true, x: e.clientX, y: e.clientY, emotion, id })
    }
  }, [isMobile, activeCategory])

  const handleSVGMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (tooltip.visible) {
      setTooltip(prev => ({ ...prev, x: e.clientX, y: e.clientY }))
    }
  }, [tooltip.visible])

  const handleSVGMouseOut = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = (e.target as Element).closest('[data-emotion]') as HTMLElement | null
    if (!target) return
    // Don't fire if mouse is still within the same data-emotion element
    const related = (e.relatedTarget as Element | null)?.closest('[data-emotion]')
    if (related === target) return

    target.style.transform = 'scale(1)'
    const id = target.getAttribute('data-emotion') || ''
    const emotion = EMOTIONS[id]
    if (emotion && !activeCategory) {
      const lines = document.getElementById(emotion.cat + '_lineas')
      if (lines) lines.querySelectorAll('line').forEach((l: Element) => {
        ;(l as SVGLineElement).style.stroke = ''
        ;(l as SVGLineElement).style.strokeOpacity = ''
        ;(l as SVGLineElement).style.filter = ''
      })
    }
    if (hoveredEmotionRef.current === target) hoveredEmotionRef.current = null
    setTooltip(prev => ({ ...prev, visible: false }))
  }, [activeCategory])

  const handleSVGClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = (e.target as Element).closest('[data-emotion]') as HTMLElement | null
    if (!target) return
    const id = target.getAttribute('data-emotion') || ''
    const emotion = EMOTIONS[id]
    if (!emotion) return

    if (emotion.nivel === 1 && !isMobile) {
      highlightCategory(emotion.cat)
    } else {
      setInfoPanel({ visible: true, emotion, id })
    }
  }, [isMobile, highlightCategory])

  /* ── TOOLTIP POSITION ─────────────────────────────────────────────────── */
  const getTooltipStyle = (): React.CSSProperties => {
    const tw = 280, th = 150, margin = 16
    let left = tooltip.x + 16
    let top  = tooltip.y - th / 2
    if (left + tw + margin > window.innerWidth)  left = tooltip.x - tw - 16
    if (top < margin)                             top  = margin
    if (top + th + margin > window.innerHeight)   top  = window.innerHeight - th - margin
    return { position: 'fixed', left, top, zIndex: 200, pointerEvents: 'none',
      opacity: tooltip.visible ? 1 : 0,
      transform: tooltip.visible ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.96)',
      transition: 'opacity 0.18s, transform 0.18s' }
  }

  /* ── KEYBOARD ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setInfoPanel(prev => ({ ...prev, visible: false }))
        setActiveCategory(null)
        CAT_GROUPS.forEach(c => {
          const el = document.getElementById(c); if (el) el.style.opacity = '1'
          const lines = document.getElementById(c + '_lineas'); if (lines) { lines.style.opacity = '1'; lines.querySelectorAll('line').forEach((l: Element) => { (l as SVGLineElement).style.stroke = ''; (l as SVGLineElement).style.strokeOpacity = ''; (l as SVGLineElement).style.filter = '' }) }
        })
        document.getElementById('labels-overlay')?.querySelectorAll('text').forEach(t => { t.style.opacity = '1' })
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [highlightCategory])

  /* ── PARTICLES ────────────────────────────────────────────────────────── */
  const particles = mounted ? Array.from({ length: isMobile ? 25 : 55 }, (_, i) => {
    const colors = Object.values(CAT_COLORS)
    const color  = colors[i % colors.length]
    const size   = (i % 3) + 1
    return {
      key: i, color, size,
      left: `${(i * 17.3) % 100}%`,
      animationDelay:    `${(i * 0.37) % 20}s`,
      animationDuration: `${10 + (i * 0.53) % 15}s`,
    }
  }) : []

  /* ── RENDER ───────────────────────────────────────────────────────────── */
  if (!mounted) return null

  return (
    <div style={{ minHeight: '100vh', background: '#0a0612', color: '#fff', fontFamily: 'DM Sans, sans-serif', position: 'relative', overflowX: 'hidden' }}>

      {/* Background glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `radial-gradient(ellipse 60% 40% at 30% 20%, rgba(0,107,212,0.08) 0%, transparent 70%),
                     radial-gradient(ellipse 50% 35% at 75% 60%, rgba(123,0,156,0.08) 0%, transparent 70%),
                     radial-gradient(ellipse 40% 30% at 50% 100%, rgba(173,63,0,0.06) 0%, transparent 70%)` }} />

      {/* Particles */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {particles.map(p => (
          <div key={p.key} style={{
            position: 'absolute', bottom: '-10px', left: p.left,
            width: p.size, height: p.size, borderRadius: '50%',
            background: p.color, boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            animation: `floatParticle ${p.animationDuration} ${p.animationDelay} linear infinite`,
          }} />
        ))}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes floatParticle {
          0%   { transform: translateY(0) scale(0); opacity: 0; }
          10%  { opacity: 0.8; }
          90%  { opacity: 0.5; }
          100% { transform: translateY(-100vh) scale(1.2); opacity: 0; }
        }
        @keyframes pulseGlow {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(255,255,255,0.1)); }
          50%       { filter: drop-shadow(0 0 14px rgba(255,255,255,0.28)); }
        }
        [id$="_nivel_uno"] circle[id*="_ca"] {
          animation: pulseGlow 4s ease-in-out infinite;
        }
        #universo-svg [data-emotion] {
          cursor: pointer;
          transform-box: fill-box;
          transform-origin: center;
        }
        /* Category colors */
        #felicidad circle { fill: rgba(0,107,212,0.15); stroke: #006bd4; }
        #amor circle { fill: rgba(255,185,210,0.1); stroke: #ffb9d2; }
        #alegria circle { fill: rgba(255,207,28,0.12); stroke: #ffcf1c; }
        #emociones_sociales_y_morales circle { fill: rgba(123,0,156,0.15); stroke: #7b009c; }
        #actitudes circle { fill: rgba(21,187,0,0.12); stroke: #15bb00; }
        #sorpresa circle { fill: rgba(116,230,0,0.12); stroke: #74e600; }
        #tristeza circle { fill: rgba(0,153,94,0.12); stroke: #00995e; }
        #miedo circle { fill: rgba(0,43,23,0.4); stroke: #3a7a5e; }
        #asco circle { fill: rgba(197,255,90,0.1); stroke: #c5ff5a; }
        #ira circle { fill: rgba(173,63,0,0.15); stroke: #ad3f00; }
        #ansiedad circle { fill: rgba(0,18,162,0.2); stroke: #0012a2; }
        #emociones_esteticas circle { fill: rgba(255,225,30,0.1); stroke: #ffe11e; }
        #universo-svg text { fill: rgba(255,255,255,0.85) !important; font-family: Raleway, sans-serif; }
        /* Connection lines per category */
        #felicidad_lineas line { stroke: rgba(0,107,212,0.35); stroke-width: 0.8px; }
        #amor_lineas line { stroke: rgba(255,185,210,0.3); stroke-width: 0.8px; }
        #alegria_lineas line { stroke: rgba(255,207,28,0.35); stroke-width: 0.8px; }
        #emociones_sociales_y_morales_lineas line { stroke: rgba(123,0,156,0.35); stroke-width: 0.8px; }
        #actitudes_lineas line { stroke: rgba(21,187,0,0.35); stroke-width: 0.8px; }
        #sorpresa_lineas line { stroke: rgba(116,230,0,0.35); stroke-width: 0.8px; }
        #tristeza_lineas line { stroke: rgba(0,153,94,0.35); stroke-width: 0.8px; }
        #miedo_lineas line { stroke: rgba(58,122,94,0.35); stroke-width: 0.8px; }
        #asco_lineas line { stroke: rgba(197,255,90,0.3); stroke-width: 0.8px; }
        #ira_lineas line { stroke: rgba(173,63,0,0.35); stroke-width: 0.8px; }
        #ansiedad_lineas line { stroke: rgba(0,18,162,0.35); stroke-width: 0.8px; }
        /* Prism central lines — white */
        #prisma_central line { stroke: rgba(255,255,255,0.35); stroke-width: 0.8px; }
        /* Dotted elliptical paths */
        #puntos_cuatro, #puntos_tres, #puntos_dos, #puntos_uno {
          fill: none !important; stroke: rgba(255,255,255,0.12);
          stroke-width: 1px; stroke-dasharray: 3 9;
        }
        /* Comets */
        #cometa_esperanza_ca, #cometa_pasion_ca { fill: rgba(255,255,255,0.15) !important; stroke: rgba(255,255,255,0.4); stroke-width: 0.5px; }
        #cometa_esperanza_cb, #cometa_pasion_cb { fill: rgba(255,255,255,0.8) !important; }
        #cometa_ca { fill: rgba(255,255,255,0.12) !important; }
        #cometa_cb { fill: rgba(255,255,255,0.7) !important; }
        /* Emociones estéticas (uses path + ellipse, not only circle) */
        #emociones_esteticas path, #emociones_esteticas ellipse, #emociones_esteticas circle {
          fill: rgba(255,225,30,0.12) !important; stroke: #ffe11e; stroke-width: 0.6px;
        }
        #universo-svg { cursor: grab; }
        #universo-svg:active { cursor: grabbing; }
      `}</style>

      {/* Header */}
      <header style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '52px 24px 36px',
        background: 'linear-gradient(180deg, rgba(10,6,18,0.97) 0%, transparent 100%)' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.3em', fontWeight: 800, marginBottom: 16,
          fontFamily: 'Raleway, sans-serif', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
          <span style={{ color: '#fff' }}>GIRO</span><span style={{ color: '#7b009c' }}>LAB</span>
        </div>
        <h1 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 'clamp(26px, 5vw, 54px)', fontWeight: 800,
          letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 10,
          background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.55) 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          El Universo de las Emociones
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', fontWeight: 300, letterSpacing: '0.03em', marginBottom: 6 }}>
          Explora el mapa completo de la experiencia humana
        </p>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em' }}>
          Basado en el trabajo de{' '}
          <span style={{ color: 'rgba(255,255,255,0.45)' }}>Rafael Bisquerra</span>,{' '}
          <span style={{ color: 'rgba(255,255,255,0.45)' }}>Eduard Punset</span> &{' '}
          <span style={{ color: 'rgba(255,255,255,0.45)' }}>PalauGea</span>
        </p>
      </header>

      {/* Legend */}
      {!isMobile && (
        <div style={{ position: 'fixed', top: '50%', left: 16, transform: 'translateY(-50%)',
          zIndex: 100, display: 'flex', flexDirection: 'column', gap: 5 }}>
          {CAT_GROUPS.map(cat => (
            <button key={cat} onClick={() => highlightCategory(cat)}
              style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 10,
                color: activeCategory === cat ? '#fff' : 'rgba(255,255,255,0.4)',
                background: activeCategory === cat ? 'rgba(255,255,255,0.08)' : 'transparent',
                border: `1px solid ${activeCategory === cat ? 'rgba(255,255,255,0.2)' : 'transparent'}`,
                borderRadius: 20, padding: '3px 8px', cursor: 'pointer', whiteSpace: 'nowrap',
                fontWeight: 500, letterSpacing: '0.03em', transition: 'all 0.2s', fontFamily: 'DM Sans, sans-serif' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%',
                background: CAT_COLORS[cat], boxShadow: `0 0 6px ${CAT_COLORS[cat]}`, flexShrink: 0 }} />
              {CAT_NAMES[cat]}
            </button>
          ))}
        </div>
      )}

      {/* Controls */}
      <div style={{ position: 'fixed', bottom: 28, right: 20, zIndex: 100, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { label: '⟳', action: () => {
            if (panZoomRef.current) { panZoomRef.current.resetZoom(); panZoomRef.current.center() }
            setActiveCategory(null)
            CAT_GROUPS.forEach(c => {
              const el = document.getElementById(c); if (el) el.style.opacity = '1'
              const lines = document.getElementById(c + '_lineas'); if (lines) lines.style.opacity = '1'
            })
            document.getElementById('labels-overlay')?.querySelectorAll('text').forEach(t => { t.style.opacity = '1' })
          }},
          { label: '+', action: () => { if (panZoomRef.current) panZoomRef.current.zoomIn() } },
          { label: '−', action: () => { if (panZoomRef.current) panZoomRef.current.zoomOut() } },
        ].map(btn => (
          <button key={btn.label} onClick={btn.action}
            style={{ width: 42, height: 42, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)',
              color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', fontFamily: 'Raleway, sans-serif' }}>
            {btn.label}
          </button>
        ))}
      </div>

      {/* SVG Container */}
      <div ref={containerRef} style={{ position: 'relative', zIndex: 5, maxWidth: 920, margin: '0 auto', padding: '0 16px 80px' }}
        onMouseOver={handleSVGMouseOver} onMouseMove={handleSVGMouseMove}
        onMouseOut={handleSVGMouseOut} onClick={handleSVGClick}
        dangerouslySetInnerHTML={{ __html: SVG_CONTENT }} />

      {/* Tooltip */}
      {tooltip.emotion && (
        <div style={getTooltipStyle()}>
          <div style={{ background: 'rgba(8,4,20,0.96)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)', maxWidth: 260 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const,
              color: CAT_COLORS[tooltip.emotion.cat] || '#fff', marginBottom: 4 }}>
              {CAT_NAMES[tooltip.emotion.cat]}
            </div>
            <div style={{ fontFamily: 'Raleway, sans-serif', fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 6, lineHeight: 1.2 }}>
              {tooltip.emotion.name}
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.6, color: 'rgba(255,255,255,0.72)', marginBottom: 6 }}>
              {tooltip.emotion.desc}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em' }}>
              {NIVEL_NAMES[tooltip.emotion.nivel]} · Nivel {tooltip.emotion.nivel}
            </div>
          </div>
        </div>
      )}

      {/* Overlay */}
      <div onClick={() => setInfoPanel(prev => ({ ...prev, visible: false }))}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(4px)', zIndex: 150, opacity: infoPanel.visible ? 1 : 0,
          pointerEvents: infoPanel.visible ? 'all' : 'none', transition: 'opacity 0.3s' }} />

      {/* Info Panel */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 160,
        background: 'linear-gradient(180deg, rgba(15,10,30,0.99), rgba(8,4,20,1))',
        borderTop: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px 24px 0 0',
        padding: '32px 28px 52px', maxHeight: '72vh', overflowY: 'auto',
        transform: infoPanel.visible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)' }}>
        <button onClick={() => setInfoPanel(prev => ({ ...prev, visible: false }))}
          style={{ position: 'absolute', top: 20, right: 20, width: 36, height: 36,
            borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 18,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          ×
        </button>
        {infoPanel.emotion && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em',
              textTransform: 'uppercase' as const, color: CAT_COLORS[infoPanel.emotion.cat] || '#fff', marginBottom: 8 }}>
              {CAT_NAMES[infoPanel.emotion.cat]}
            </div>
            <h2 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 'clamp(26px,6vw,36px)',
              fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16, lineHeight: 1.1 }}>
              {infoPanel.emotion.name}
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: 'rgba(255,255,255,0.72)', marginBottom: 20 }}>
              {infoPanel.emotion.desc}
            </p>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'inline-block', width: 24, height: 1, background: 'rgba(255,255,255,0.25)' }} />
              {NIVEL_NAMES[infoPanel.emotion.nivel]} · Nivel {infoPanel.emotion.nivel}
            </div>
          </>
        )}
      </div>

      {/* Footer credits */}
      <footer style={{ position: 'relative', zIndex: 5, textAlign: 'center',
        padding: '0 24px 40px', color: 'rgba(255,255,255,0.2)', fontSize: 11, letterSpacing: '0.06em' }}>
        Basado en el trabajo de Rafael Bisquerra, Eduard Punset & PalauGea
      </footer>

    </div>
  )
}
