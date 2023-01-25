module.exports = {
  wrapper: {
    serviceName: 'quickfin/api',
    fastify: {
      logger: {}
    },
    cors: {
      credentials: true,
      methods: [
        'GET',
        'POST',
        'PUT',
        'DELETE'
      ],
      origin: [
        'https://quickfin.be',
        'https://www.quickfin.be'
      ],
      strictPreflight: true
    }
  },
  bcrypt: {
    cost: 13
  },
  key: {
    iss: 'https://quickfin.be',
    p: "6fQKXqmbWlFsD5LtwD4eQciSD0_jDXrjGEUAg-LB_hWbsd-fgRX8wBUACMJs6IcacnRqH5fmzu1jggWeaP21pRelFIBWpz4G7fJEkhAYdHxT9QYdWWqQcb5IQGUxOOfUWhCO0jmpQDmolrv8diUa-kVb9zqRvqOYV3Ls5ga791QXrHWFeB1jGPRwosAQeNj1YLnkdnDc88AwVwKBuU83TOV4t6SSuQLJOh5oovlFxB43qko647bCzHNwqGRhMjLkPJ_22JXeeXwjaq5vrFTY73yffB1-BW7__mIBfuB45CzV4TxJA2YwVdano8afuEjY1gt43UXNgWJ3ZsaQwfNCyJM0whcYP6qsHpMrwFxnE5cXKisyy4dgRWkMVQpELyMLlUCqpIORftQnRVFu5ONtB9qoi2G2NY7WIKoJKazvOwIKdQGBfFM7b3CAyF-HkfH3K_5FCaaV3O8baLyS3ZhtYLMr5t2LgFBBaXfbWz26AIhHF0lYh5iSTRM59bbE3l4xGyvmHV5CNxCKcF5Gk6p6g6GRpZlLheiCHGoX7KyRACsBudTzx4PiWJ0eeI3gHmjgR8nuxfLU0tDJe8TuzvWYeJfX2Xdfal_riu11yi_uJ0Ss3qP2QK1C25wiAG6KByy-MXJdLRuHgDbH2-TkT-2LreXzZejWol6KMTUSPY6o5Mc",
    kty: "RSA",
    q: "nX2Q2ziAL7EbJtOEzAkZ_WiXmlkjaMD_X-D_mbnWOhiwdeEumPJDci3TmaChpX5th4xnbQ2XFiPTnhE_qmmUnj7utuaL1sk77B8CGdBzTpBGO-NfvyN4s9jNMMi19crOBYVIZLcQw456qc3eiDVYarGBMwjx8X5sZPSFJoQaK1w2p-W4xqsz4JGAnlhQ8sY28M2zayKb5_WthE6Ao45anxSDRRiuDNjJOQhcZ0q5ZLFqFU1WY0jSr6zovTBvvkTtsigWj3hgF7ull44hphllUuoOFmQYIedJASk6weGOuOQZdPfoJCuwRzO3lBN7ifcRfLlSyj4dg1n7ccCKzOZyyElVJz-B6Mr7juxEI51pjwhwN16C3zWuVcG7bnwo8Zr5tcxMDDXK9Wr-g2BwvElYdhsKUbaF90BgZgLybeSIslvpkAX_qExkeSWvuGd3RiRCi-Yu-O4QNDcPcwAXpRn0McynVz3KWv4qmeIY8EMFOGz949P4FFDbS96QIrbJ5NTF3MQAiKx5u1xcjBBfTASWCgHDfVVGKG8AWCUX03sflFaSGfNo7ju1izoyOTqs3zihMJ0cAsIax536ldbgEKetYp12berdeT3rS9eooHs4fpIx_vZEdzLltLOJTnKnmdpDm9u22gOFuuMrDMK7uJV8X4oNj1nYlxccHjfp-oxg2rM",
    d: "cbRQEw6jI9pWBJXRCDtDiWZp3Q_jujth2ViJbfDh-cpHJSpKWyVMIITCvCwQkh2wLQyUsn2E1bJEoGgbpVBD2FLX5scLzLRRXwJSYqjDQYz1yUoOhZK555gZ2zc78SxPZ2dcWgZ0AZJLuAvbTATYKKE4ZAbo7mLnkysktDqAGAgAEJNk6OboXTu-xKmu202kodREF_oNjcOizZtnBZu-pzrLUlpSxhKAFLx9sarTB8GyRCEVejIZ-7_QzLELw2gxIqA9oU-CN5nSKfZhCaAPThqkA8t2y_jEtJcNaGwG782UP2aw8iuT7ijWswP8AUBjKqYFaJAZBqX10hSBgxiw4SessYpTe18Mh7GuDbyBHLhhG3VNJ0ah_wOlcI2a0fM4Paiofdik_8W_KUZlZ3mgD980ctwYInkEsCntIqCWCKyYwKI6SbSZMqh__9CO_MGod1PXp_FPQkv-Upo9FPAHMRRzQ14C2yWz7nSUNKMZi0UOpOrEIUT6lYhyV9b17LwRdvfqELfpC-9NolOlcQxYtm_sB872MOZy1eL7lpZkp3v1Wpqjn0incOV1V1mmfLrHSE-wee2-D68d0F-RQFl3GmsHTw-Q_bDA6i8cS1PDkvLgxhkKJjbw2Ds05hZQA7cFVKrC4YwOwZuqHKVFdj3FOBLI3JtnYwWM_W_gXBGw0b0G2wqYbo5aICJVUcBW7qI4nSOJSwx1hNoZ3oYdDI50ZS379nHz-xdCCEmCBDvgBfya0x9KVWUxXM0uVqJFwl4kL4bnRyODwCT6spA7_ZcHXUFf93o7mMAKAGGx2U9NdDw57Gs9Z0Mfu3RHWuTfsnHpSV6lb4LoUr2ggu9efyh71WQaLZRwtubjxV_D8zDyJ7-WVJ1hZDacRmjvyfeIQvCdlZaytJeBlDd2TbbZeVIOudBaT-zJ7KFf5UAATn2GG1AifZGSLFkkaoeuF0T-gOIUt3NSp-vI-VnXPGZEGUY5-r2nfHMBIuG2Eqr6d0bgaHE10tuZBTr2VwwO_ZYl0hFhSJSrKxfPcbV7m9t4B974labIBNHlmolpJtjgUwndu3rAsMuULPaUVHchSaA59TId50NkJ_58PTHxbCGLP4ccCG4vvMfGjNo4VY1iwLR4uluBobkZd6M9Hg1-BotF_3wHhv4qVk36UFuS1iB0WGf-PIBh2nysmXszBNVDtLdsgJUf4ytiRaBiT8ZOSvE1osuItYZvk3WjRj9Mf3OVqkG6uf5SlFuMgo52q8mt7UXdJhghTLcKI2_KHIiBpCWtXMKL69J8ZxfovH7SZTP53Xymddpz9epFmMnutrQDIMLr5jpmJA1GM5GXtUvQtJD-nPaEpT9V28VIPKXnilRO0yB1VQ",
    e: "AQAB",
    use: "sig",
    kid: "E0x9D2mx3yKTob7hFbJWGM6TCKabhX4itHymuRM_vu0",
    qi: "hOBiLM1CxFXSnJCNTfy_BuFy5b1pYEapUIdHYFP-3kbjiOwS4trGeBD9vjSXv0FS0axstAd8sXSvGur2sPwIOP0QtU3Lz02Y_WTNr6rCRAx581cwoKzgrTfzSKNi6sw8V32kfGveT1wL4Aek-voVbLsQie-xMPrEGZTIfkcNKt-T7XeA6jPEl4D-gQ3yU3CV7MNvOldjKT-O26MHSh7u8R92FL0g-dJnySBuYVNqwXlGEK_VsBW--9fID1cF2Mts9noSQsj-pXZK6RXFFbh5WaBA5hBVvf8VOICTieq2pSP1ZdYoNOo82hevEwOytdGar3uxp-0eKo7IyrYHOCTZTcM9WDxv2WV5ez0ncMIf1x4LHv-j6K24WCCyC1kIlf-DiyqI7KE5Aa_V0CUVmSOa8KDB19Mc-coWImTZageV8iBm8wkyi4eCKdS-lRfp3dOCmcn4nAIf7A6_dxvRvtEngpafqzSbwGVVH_GG3QUv3XJs1TJapBisnzJBxtM4Zqhx5Yk8J0IcBeLRD1JSmqynJNRtQRXZayvRVfZhz2W3u81I2A-5n03EXDGJEesudK-4Fja-dH-Ui5e_46R4NVY3n7SC6egoDAVDhNIm0MxsMqQivrgFCyVnUojaaYCrvPt4yicfRghOhPSn_Jdk67zSdffGcYndJVyvjDj14vIAQb4",
    dp: "lnd0a-mdlvsjCukurCPHhfufpOV2XGcaw7MtX6Vpqybumfn_NiCUDF31Raz2Kp8p7U7eKi-iLJgVFbzTYyc5ulJ4w7S_BpUoE8VrQJ3FfLWxsbcbDTUybVU6VuA-RiEkPEDF-oNHTZ1HxpplBv9aWHhfa6RptDi3dBbgMhlGrw2QpER5cQVFhPlBsArjDTZMqsckHuD72nFTJcLg9_Pw1y4G8-WO0BrwnMaN-bNkoXvlxUo0kdwrcR8V59eXg5ejnzIqqqXJDk0-4hAKlsWDOJPoZwT41jnLvyn9WEK6vdXwQQpq0xrYH30NGJJYi0ee3htGwtlwELTpolo3I-Z2n1W96s67s8brKEbzLqa_TKQyK9bYtnn8-udTHSabL83UV0vd9C0CWJXOJBD5x5BVwWVqXSqc69lP8nYpqnok6sinPRWY2AMYCNZMnZKDOORsWgkREeHoJM5LzJLrykWMo1LY-4SlggMb7t89X3NVu53qSxnLLHp-LcAd2OCRwYrG_ni_aUgEQjILN7YKolJUtXAmomDzZ85gUDIT7Q4XvAns9D34A-vYmbGDtXlaGXTOOp2vSfSh2GycCVRhWw4t3_GYy66w2VOTxChxR3aILw1GOXMun-5PP7stSyXM9ExcjqTFNIuuHFIfPFf8V0OqQE_SuUqFMKypKHi_oIOuMGU",
    alg: "RS512",
    dq: "Cf3zeNUm3N_Btz7oSAGz0m4WYEaThovoJ-8giGJQAzOZzoDQ8gc83DuoFzEn0FYrINR5o2OfWFpBjN_PSEKWmUuo3ZXW_XObB6oX-gdNqYhhzF7qrjfT6qUwr42sbcHGPHduVmV-_MlHYwqauc2YpHxKlDBXGVlKC0WwRPdQqbuaBCEBDinCitbwcBtuV1jYF4MVhRCXD6p4rdJFOxtHCJzGj1W3hT0j1yh-pFcLWCYhcuSLPJVcOKUhxw8Rp-K7qff9JnEet6LCKNFttRobYZ1T83u6RDxmV1qETdS_t19RdihcZB8Zegr_9LcfuWshguZHKGm0eab12wu6QrHESozMiEbxORHX0AORdyj_j4GbjQfECeFgBDTcbXAXMO0CNtSVZpjrHZMCPteZj3if0i55AyIvcbZ150L8mphLS_Wk5exbghQGs-D-OxblbF_UkQezpzuDb6ymoEc7ONBiu94eJ9zVv9wsW8MKjgPSivfvS8shDDjtEO03-9vZB1mwjAcreYBn4MlFXeWUBkCsPEpMWuFUKDCStwTzdAl1wXWUo2zcFXFYXVL96L-eRDNVlr4BDvO9uzh8s5EEekoJKB6RavvhvVV-Xjt6iWQH-4_O-Dwrr9xc0pApf_6qP4qni3XvLfnXPDo5ev_H5TgmwfECVzv-D-f5crldcPYDFx0",
    n: "j-1q5rt5vYEQnO_LihXxQkU_pcguSm3-v2mLJ5UAUJicXHf9dKxIFGAoCPklTArUcBrT05Hux4tmrN9K5qOteESNH4ujwTSvB-yqA_sk5Gp2CSBwkuqSsbROrEzpet3NTEg6RcK1X4sjjCio-0xq7TFvV0BqluUCCFR9kRJhVGC77qwBdwwQ2fj9HpBi1cCAtjzlTlYC_tWD1KhkW6UF5MhsA0Bv3ZzQjdR9o8nFwcrRP8kQonQWUZAhDSWGnY9v1UlcxVlwLkK6u1lEedtixsmJiFniLpq8UmS6j-u-iMvZ1WIf74cRkQAbqyV4JFV7age5Okw94PkvE5YvsUFe6IqNoCRCBue1Ez1vDgzM7LqX9mttNh2-CfxurZNtG4GcQSwt-ed1txAWx39RjGxSOVy0miG56PRfFADgbCJbgjS0ieLpSiqgNQNcTMzfiUG7n3Il4it6TK9fokuPUkG7gTjUGN36ayEyk-lT8sPhjcQSlMk-wqZIJvo4JBTQp7nwFXxQZnWO_4_JvM-bePIXC4xpFB0zuTLGAglF8oLqfGpy32u8d9DX3Q6SkWlzLu8qBMBiJVd7g9cbU1iMdk4SC_ddmCaRL49CWDgpYyvqkv3RcBNN756RyeDJRCLHqGsziODVL_YIj-p14zriXYkkYrYhGGRzrE37-F65pRTQz-aD8shrwQDWXqfki31f8iklzIxmqR4yt_0u1HiSHdxD2RYaYCKjsQRCk1cW7AIe5hy11RmgkPCxv6EZ1CZZ4BAxZeQK1vSBJEYiWTP0UVWZlheI1Xv72N5WHMLPrZW7IN1fIPB5m--9ymwO-dlONAKwVE8k4opJvvh5k8_IkX8fZmaQr_HrPQ9L-oBGU4aawsboYvBA8_GVufn94fzXRe6uwpAqJVICmWK1ZLW31lDuao1plFRQ8t-H6sU5QGnH5JW0Ao-Dlgfxy_EaASFus9gvCUWvPV6uXcUpZ6wZb-2r0Lqo0lGRh3-J1UdJn6jaICj4mMRgIE07vQyCoXKRYMxScn1NRRLsqempy8uASsLMRMFNyak4B2b2WCz30oXLc6xNrIXm36elZ6KcYZpEOI3zhr3DajzCd5P9UZRBJizaZxYznGtttz-JahQVbuz40sTqP36QAY3eFsc-EqMWLKIh3Udy_sNJK1DMt-uiciC5x2IEQFHENwkZPSUDF6w_WY82Coc-BSuA-vCyhL9NFI5DlcA1oF5NPJ6UBQ7lKeMWeaROGjQj0VvSHIeXbdu0MMDeyrbmfBgNPrGgc-NUz3QwePaGhcZ6Y-wk5dBBOzIjdMRSoo1T_NqU_efyP7KiL2PXv_xvHhnwhLZkt-kl5YkuLHeU1XyMcTmcp5JPMYltJQ"
  },
  mssql: {
    quickfin: {
      user: 'sso',
      password: 'WWp1Q2JHSnVUbnBoUXpGeVju6EJkR1JxUlVGQlFVRkJRa2MxZG1KdFZVRkJRVUZG',
      server: '172.18.21.4',
      database: 'quickfin',
      options: {
        enableArithAbort: true,
        trustServerCertificate: true
      },
      connectionTimeout: 500,
      parseJSON: true,
      pool: {
        max: 5,
        min: 0,
        idleTimeoutMillis: 60000
      }
    }
  }
}