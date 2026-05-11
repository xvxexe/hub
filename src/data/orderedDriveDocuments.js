const rows = `
Bonifico|1nZnAydETOujKsfNYdoao9KQwKzC0ea31|2026-03-20_Bonifico_Eurofer_307-00_Fattura-2885B.pdf|Piscina|EUROFER 2885/B|Eurofer|307|Bonifici / Pagamenti|https://drive.google.com/file/d/1nZnAydETOujKsfNYdoao9KQwKzC0ea31/view?usp=drivesdk
Bonifico|1tSsMw8X8VtzIfhbsjj5yIyJCn5r6PZ6a|2026-03-21_Bonifico_Eurofer_804-97_Fattura-2899B.pdf|Piscina|EUROFER 2899/B|Eurofer|804.97|Bonifici / Pagamenti|https://drive.google.com/file/d/1tSsMw8X8VtzIfhbsjj5yIyJCn5r6PZ6a/view?usp=drivesdk
Bonifico|11Hrckq0Zm-tc-oisdhY0wioMd9Bc7k0H|2026-03-23_Bonifico_Eurofer_1139-11_Fattura-2983B.pdf|Piscina|EUROFER 2983/B|Eurofer|1139.11|Bonifici / Pagamenti|https://drive.google.com/file/d/11Hrckq0Zm-tc-oisdhY0wioMd9Bc7k0H/view?usp=drivesdk
Bonifico|1113U7Put_Vsr0k3uiu1kvLanyRkPfGqy|2026-03-27_Bonifico_Elelettrixa_104-05_Fattura-534-2026.pdf|Piscina|ELELETTRIXA 534/2026|Elelettrixa Romana|104.05|Bonifici / Pagamenti|https://drive.google.com/file/d/1113U7Put_Vsr0k3uiu1kvLanyRkPfGqy/view?usp=drivesdk
Bonifico|1u3Ng546hM7o-RxR_PGK9D2Eo9AOEenTb|2026-03-27_Bonifico_Eurofer_356-00_Fattura-3180B.pdf|Piscina|EUROFER 3180/B|Eurofer|356|Bonifici / Pagamenti|https://drive.google.com/file/d/1u3Ng546hM7o-RxR_PGK9D2Eo9AOEenTb/view?usp=drivesdk
Bonifico|1PQIpgAScLIMqyqQhxWLa-KWdykBln3i2|2026-03-28_Bonifico_Eurofer_344-36_Fattura-3205B.pdf|Piscina|EUROFER 3205/B|Eurofer|344.36|Bonifici / Pagamenti|https://drive.google.com/file/d/1PQIpgAScLIMqyqQhxWLa-KWdykBln3i2/view?usp=drivesdk
Bonifico|14SbR-kWbfr0lKy_x2vK59Fdg07qj-imZ|2026-04-07_Bonifico_Comfer_412-08_DDT-2637.pdf|Piscina|COMFER DDT 2637|Comfer|412.08|Bonifici / Pagamenti|https://drive.google.com/file/d/14SbR-kWbfr0lKy_x2vK59Fdg07qj-imZ/view?usp=drivesdk
Bonifico|1FnVm9MXZ8bdTsy0B0bs8id3Iy8wsLO_-|2026-04-07_Bonifico_Comfer_1922-40_Docc-2602.pdf|Piscina|COMFER Docc 2602|Comfer|1922.40|Bonifici / Pagamenti|https://drive.google.com/file/d/1FnVm9MXZ8bdTsy0B0bs8id3Iy8wsLO_-/view?usp=drivesdk
Bonifico|18bRgTYNNUhR9_jYIDZUHrO3WwiM6BThf|2026-04-07_Bonifico_Eurofer_255-29_Fattura-3562.pdf|Piscina|EUROFER 3562|Eurofer|255.29|Bonifici / Pagamenti|https://drive.google.com/file/d/18bRgTYNNUhR9_jYIDZUHrO3WwiM6BThf/view?usp=drivesdk
Bonifico|1LLG6IGc_21Gd9ppYdRb-9CF-aV5dI9Aa|2026-04-02_Bonifico_Loris_Botone_2200-00_Affitto_Appartamento_Roma.pdf|Alloggi|Affitto appartamento Roma|Loris Botone|2200|Alloggi|https://drive.google.com/file/d/1LLG6IGc_21Gd9ppYdRb-9CF-aV5dI9Aa/view?usp=drivesdk
Bonifico|1woylafSzldfzAY7BTBvN8h9C2w86mdJ_|2026-03-30_Bonifico_Eurofer_476-89_Fattura-3250B.pdf|Scala_Aiuola|3250/B|Eurofer|476.89|Bonifici / Pagamenti|https://drive.google.com/file/d/1woylafSzldfzAY7BTBvN8h9C2w86mdJ_/view?usp=drivesdk
Bonifico|1vGt0-nYjX8CzZfCajcBqiUlZv-ml5C_j|2026-03-30_Bonifico_Eurofer_265-95_Fattura-3276B.pdf|Scala_Aiuola|3276/B|Eurofer|265.95|Bonifici / Pagamenti|https://drive.google.com/file/d/1vGt0-nYjX8CzZfCajcBqiUlZv-ml5C_j/view?usp=drivesdk
Bonifico|1XpNPwmMJ-62d8FHmwFAZk1NoA3ltkcOH|2026-04-01_Bonifico_Eurofer_166-07_Fattura-3366B.pdf|Scala_Aiuola|3366/B|Eurofer|166.07|Bonifici / Pagamenti|https://drive.google.com/file/d/1XpNPwmMJ-62d8FHmwFAZk1NoA3ltkcOH/view?usp=drivesdk
Bonifico|1pC_nyrW8EosMHPlT9cU2dCModbjg7ikb|2026-04-10_Bonifico_Eurofer_199-18_Fattura-3692B.pdf|Scala_Aiuola|3692/B|Eurofer|199.18|Bonifici / Pagamenti|https://drive.google.com/file/d/1pC_nyrW8EosMHPlT9cU2dCModbjg7ikb/view?usp=drivesdk
Bonifico|1GNhpz6U7BvIkVg9VRFuBvZjBtKL2A1wz|2026-03-24_Bonifico_Eurofer_203-92_Fattura-3030B.pdf|Massetti_Griglia|EUROFER 3030/B|Eurofer|203.92|Bonifici / Pagamenti|https://drive.google.com/file/d/1GNhpz6U7BvIkVg9VRFuBvZjBtKL2A1wz/view?usp=drivesdk
Bonifico|16Kj-UCstckC3BlN3GnrN8wA4AVV4UewU|2026-03-25_Bonifico_Edil_Nollo_1000-00_Acconto_Benne.pdf|Massetti_Griglia|Edil Nollo - Acconto benne|Edil Nollo|1000|Noleggi / Servizi|https://drive.google.com/file/d/16Kj-UCstckC3BlN3GnrN8wA4AVV4UewU/view?usp=drivesdk
Bonifico|1okTBRG9akw-f6BVwOCp5vmvGjiJBy-3k|2026-03-25_Bonifico_Eurofer_202-35_Fattura-3060B.pdf|Massetti_Griglia|EUROFER 3060/B|Eurofer|202.35|Bonifici / Pagamenti|https://drive.google.com/file/d/1okTBRG9akw-f6BVwOCp5vmvGjiJBy-3k/view?usp=drivesdk
Bonifico|1uItw5YVlbf7GkyfNmlK9z5hg5g0YbAuo|2026-04-09_Bonifico_Eurofer_213-49_Fattura-3654B.pdf|Lavori_Extra_Annesso|EUROFER 3654/B|Eurofer|213.49|Bonifici / Pagamenti|https://drive.google.com/file/d/1uItw5YVlbf7GkyfNmlK9z5hg5g0YbAuo/view?usp=drivesdk
Bonifico|1yPV-UtFINBfk7aEEFpehftCtzgzNeRXm|2026-04-09_Bonifico_Eurofer_123-06_Fattura-3635B.pdf|Lavori_Extra_Annesso|EUROFER 3635/B|Eurofer|123.06|Bonifici / Pagamenti|https://drive.google.com/file/d/1yPV-UtFINBfk7aEEFpehftCtzgzNeRXm/view?usp=drivesdk
Bonifico|1fiYBQ1utBfW9TPMBBbd_AvtPhNSFvTBk|2026-04-02_Bonifico_Elelettrixa_406-41_Fattura-578.pdf|Soffitti_F2|ELELETTRIXA 578|Elelettrixa Romana|406.41|Bonifici / Pagamenti|https://drive.google.com/file/d/1fiYBQ1utBfW9TPMBBbd_AvtPhNSFvTBk/view?usp=drivesdk
Bonifico|1JCGqDc9FxjY3oPFiiv8fR4guaL2qS0Kq|2026-04-08_Bonifico_Cifarelli_Gomme_565-01_Fattura-583.pdf|Da_classificare|Saldo fattura 583|Cifarelli Gomme Srl|565.01|Da verificare|https://drive.google.com/file/d/1JCGqDc9FxjY3oPFiiv8fR4guaL2qS0Kq/view?usp=drivesdk
Bonifico|1KJZnRaOMSAdyjxaw7GyhcrhQWiRVC222|2026-04-09_Bonifico_EdilNollo_2000-00_Container_Macerie.pdf|Rifiuti_Container|Aconto container macerie|Edil Nollo|2000|FIR / Rifiuti|https://drive.google.com/file/d/1KJZnRaOMSAdyjxaw7GyhcrhQWiRVC222/view?usp=drivesdk
Fattura|1QoeyBkKhdDNa3kndH4BvZ4k1Bv_tLCP8|2026-03-20_Fattura_Eurofer_2880B_533-96_Piscina.jpg|Piscina|EUROFER 2880/B|Eurofer|533.96|Materiali|https://drive.google.com/file/d/1QoeyBkKhdDNa3kndH4BvZ4k1Bv_tLCP8/view?usp=drivesdk
Fattura|1iEor7dWoUy5RU-KhdPh3flQhz51Q_F5o|2026-03-20_Fattura_Eurofer_2885B_307-00_Piscina.jpg|Piscina|EUROFER 2885/B|Eurofer|307|Materiali|https://drive.google.com/file/d/1iEor7dWoUy5RU-KhdPh3flQhz51Q_F5o/view?usp=drivesdk
Fattura|1_Z_YEvI5mGlpgIzwrNqOX5yQOwKBYEV6|2026-03-21_Fattura_Eurofer_2899B_804-97_Piscina.jpg|Piscina|EUROFER 2899/B|Eurofer|804.97|Materiali|https://drive.google.com/file/d/1_Z_YEvI5mGlpgIzwrNqOX5yQOwKBYEV6/view?usp=drivesdk
Fattura|1AxJS99Kp6ir4x8CjgzTSXu6bKsR5fymE|2026-03-23_Fattura_Eurofer_2937B_281-38_Piscina.jpg|Piscina|EUROFER 2937/B|Eurofer|281.38|Materiali|https://drive.google.com/file/d/1AxJS99Kp6ir4x8CjgzTSXu6bKsR5fymE/view?usp=drivesdk
Fattura|1wGzcnhefzbaeM9xuPEVICiDXiB2m-j7D|2026-03-23_Fattura_Eurofer_2955B_193-21_Piscina.jpg|Piscina|EUROFER 2955/B|Eurofer|193.21|Materiali|https://drive.google.com/file/d/1wGzcnhefzbaeM9xuPEVICiDXiB2m-j7D/view?usp=drivesdk
Fattura|1qpwEY-fazRYks-qRiFRQyJrRpXejj0BZ|2026-03-23_Fattura_Eurofer_2983B_1139-11_Piscina.jpg|Piscina|EUROFER 2983/B|Eurofer|1139.11|Materiali|https://drive.google.com/file/d/1qpwEY-fazRYks-qRiFRQyJrRpXejj0BZ/view?usp=drivesdk
Fattura|1v60oogkslgfrkaEZr8b5Gf1TUPGylRnp|2026-03-25_Fattura_Alayan_51-36_Noleggio_Martello_Piscina.jpg|Piscina|ALAYAN - Noleggio martello demolitore|Alayan Rentals|51.36|Noleggi / Servizi|https://drive.google.com/file/d/1v60oogkslgfrkaEZr8b5Gf1TUPGylRnp/view?usp=drivesdk
Fattura|18_nLeAwccda0I843cDEU4xKT3tGVfGIe|2026-03-26_Fattura_Eurofer_3125B_144-11_Piscina.jpg|Piscina|EUROFER 3125/B|Eurofer|144.11|Materiali|https://drive.google.com/file/d/18_nLeAwccda0I843cDEU4xKT3tGVfGIe/view?usp=drivesdk
Fattura|1BpxR9rrJh7OwRjwXxyTBjliczevPNTS-|2026-03-27_Fattura_Eurofer_3164B_70-46_Piscina.jpg|Piscina|EUROFER 3164/B|Eurofer|70.46|Materiali|https://drive.google.com/file/d/1BpxR9rrJh7OwRjwXxyTBjliczevPNTS-/view?usp=drivesdk
Fattura|1cvNyX5YkubDd7gkj515xBzzR-OCUVRXA|2026-03-28_Fattura_Eurofer_3205B_344-36_Piscina.jpg|Piscina|EUROFER 3205/B|Eurofer|344.36|Materiali|https://drive.google.com/file/d/1cvNyX5YkubDd7gkj515xBzzR-OCUVRXA/view?usp=drivesdk
Fattura|1OdIbFcV9iBStkP5BosL2CjGDaqjCnlQe|2026-03-30_Fattura_Eurofer_3250B_476-89_Scala_Aiuola.jpg|Scala_Aiuola|3250/B|Eurofer|476.89|Materiali|https://drive.google.com/file/d/1OdIbFcV9iBStkP5BosL2CjGDaqjCnlQe/view?usp=drivesdk
Fattura|1J58vhx0KkJsfF3NZqhLbZbQWu-Nl_g5e|2026-03-30_Fattura_Eurofer_3276B_265-95_Scala_Aiuola.jpg|Scala_Aiuola|3276/B|Eurofer|265.95|Materiali|https://drive.google.com/file/d/1J58vhx0KkJsfF3NZqhLbZbQWu-Nl_g5e/view?usp=drivesdk
Fattura|1EjyDSAESzloRwiMDT_F3zpIkGzabQCsk|2026-04-01_Fattura_Eurofer_3366B_166-07_Scala_Aiuola.jpg|Scala_Aiuola|3366/B|Eurofer|166.07|Materiali|https://drive.google.com/file/d/1EjyDSAESzloRwiMDT_F3zpIkGzabQCsk/view?usp=drivesdk
Fattura|1SEKDIcN92yDHwFGT-nmRzTeTayUR7wDt|2026-04-10_Fattura_Eurofer_3692B_199-18_Scala_Aiuola.jpg|Scala_Aiuola|3692/B|Eurofer|199.18|Materiali|https://drive.google.com/file/d/1SEKDIcN92yDHwFGT-nmRzTeTayUR7wDt/view?usp=drivesdk
Fattura|1u5QE1YpL6mw4S38dwYO6I6vuXK_o3bAH|2026-03-24_Fattura_Eurofer_3030B_203-92_Massetti_Griglia.jpg|Massetti_Griglia|EUROFER 3030/B|Eurofer|203.92|Materiali|https://drive.google.com/file/d/1u5QE1YpL6mw4S38dwYO6I6vuXK_o3bAH/view?usp=drivesdk
Fattura|1Pgb5wolQAQYwQ0-W6DEzvPLMTnwqy8gF|2026-03-25_Fattura_Eurofer_3060B_202-35_Massetti_Griglia.jpg|Massetti_Griglia|EUROFER 3060/B|Eurofer|202.35|Materiali|https://drive.google.com/file/d/1Pgb5wolQAQYwQ0-W6DEzvPLMTnwqy8gF/view?usp=drivesdk
Fattura|1M8WslEdrYRN1ildOtYAmkKoxWAK5-p93|2026-04-02_Fattura_Elelettrixa_578_406-41_Soffitti_F2.jpg|Soffitti_F2|ELELETTRIXA 578|Elelettrixa Romana|406.41|Materiali / Attrezzi|https://drive.google.com/file/d/1M8WslEdrYRN1ildOtYAmkKoxWAK5-p93/view?usp=drivesdk
Fattura|1uSEHJQ1oI5aYw-YoWtLm8KaEjO8OBr1G|2026-04-02_Fattura_TE-KOM_442_153-72_Soffitti_F2.jpg|Soffitti_F2|TE-KOM 442|TE-KOM|153.72|Materiali|https://drive.google.com/file/d/1uSEHJQ1oI5aYw-YoWtLm8KaEjO8OBr1G/view?usp=drivesdk
Scontrino|17TW2j5FUoyZdluC4bmvNrwdM6-tptbux|2026-04-10_Scontrino_Tecnomat_85-40_PVC_Arancio_Scarichi_Pergole.jpg|Scarichi_Pergole|TECNOMAT - scontrino PVC arancio|Tecnomat|85.40|Materiali|https://drive.google.com/file/d/17TW2j5FUoyZdluC4bmvNrwdM6-tptbux/view?usp=drivesdk
Scontrino|199LG50q-LJQt1MazhD97FvT3SbyQbz9a|2026-03-27_Scontrino_PAM_31-00_Cena_Vitto.jpg|Vitto|PAM - Spesa Cena|PAM Panorama|31|Vitto|https://drive.google.com/file/d/199LG50q-LJQt1MazhD97FvT3SbyQbz9a/view?usp=drivesdk
Scontrino|15h9lb2q2qyUTyhMMXvbCuQ4pkQNv5VwE|2026-03-27_Scontrino_PAM_36-46_Pranzo_Vitto.jpg|Vitto|PAM - Spesa pranzo|PAM Panorama|36.46|Vitto|https://drive.google.com/file/d/15h9lb2q2qyUTyhMMXvbCuQ4pkQNv5VwE/view?usp=drivesdk
Scontrino|1_bQEhxrk0Bbkkb5S8guho9TIIeS5WJ26|2026-03-28_Scontrino_PAM_37-32_Pranzo_Vitto.jpg|Vitto|PAM Panorama - Spesa pranzo|PAM Panorama|37.32|Vitto|https://drive.google.com/file/d/1_bQEhxrk0Bbkkb5S8guho9TIIeS5WJ26/view?usp=drivesdk
FIR|1hLhYgEti8s6B-d2B2Q7o_fkpsUqRa3zj|2026-02-11_FIR_EdilNolo_VLKMJ-008324-VX.jpg|FIR_rifiuti|VLKMJ 008324 VX|EDILNOLO ROMA S.R.L.|0|FIR / Rifiuti|https://drive.google.com/file/d/1hLhYgEti8s6B-d2B2Q7o_fkpsUqRa3zj/view?usp=drivesdk
`.trim()

function parseDateFromFileName(fileName) {
  const match = String(fileName).match(/^(\d{4}-\d{2}-\d{2})/)
  return match ? match[1] : null
}

export const orderedDriveDocuments = rows.split('\n').map((line) => {
  const [type, fileId, fileName, tab, documentNumber, supplier, total, category, url] = line.split('|')
  return {
    type,
    fileId,
    fileName,
    tab,
    documentNumber,
    supplier,
    total: Number(total || 0),
    category,
    url,
    date: parseDateFromFileName(fileName),
    cantiereId: 'barcelo-roma',
    cantiere: 'Barcelò Roma',
    status: 'Confermato',
    source: 'drive-ordered-registry',
  }
})
