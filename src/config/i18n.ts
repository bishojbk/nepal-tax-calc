export type Lang = 'en' | 'ne'

const translations = {
  // Header
  'app.title': { en: 'Nepal Tax Calculator', ne: 'नेपाल कर क्याल्कुलेटर' },
  'app.actname': { en: 'Income Tax Act 2058', ne: 'आयकर ऐन २०५८' },
  'fy.prefix': { en: 'FY', ne: 'आ.व.' },
  'fy.label': { en: 'Fiscal Year', ne: 'आर्थिक वर्ष' },
  'fy.current': { en: 'Current', ne: 'हालको' },
  'fy.new': { en: 'New budget', ne: 'नयाँ बजेट' },

  // Mode selector
  'mode.nepal': { en: 'Nepal Employment', ne: 'नेपाल रोजगारी' },
  'mode.nepal.short': { en: 'Nepal', ne: 'नेपाल' },
  'mode.foreign': { en: 'Foreign Employment', ne: 'वैदेशिक रोजगारी' },
  'mode.foreign.short': { en: 'Foreign', ne: 'वैदेशिक' },
  'mode.freelancer': { en: 'Freelancer', ne: 'फ्रिल्यान्सर' },
  'mode.freelancer.short': { en: 'Freelance', ne: 'फ्रिल्यान्स' },
  'mode.nonresident': { en: 'Non-Resident', ne: 'गैर-आवासीय' },
  'mode.nonresident.short': { en: 'Non-Res', ne: 'गैर-आ.' },

  // Section tabs
  'section.calculator': { en: 'Calculator', ne: 'क्याल्कुलेटर' },
  'section.raise': { en: 'Raise Planner', ne: 'तलब वृद्धि योजना' },
  'section.insights': { en: 'Insights', ne: 'विश्लेषण' },

  // Gross slider
  'gross.label': { en: 'Monthly Gross Salary', ne: 'मासिक कुल तलब' },
  'gross.note': { en: 'Basic = 60% of gross (common employer practice, not statutory)', ne: 'आधारभूत = कुलको ६०% (सामान्य नियोक्ता अभ्यास, कानूनी होइन)' },

  // Retirement
  'retirement.title': { en: 'Retirement Contributions', ne: 'सेवानिवृत्ति योगदान' },
  'retirement.hardcap': { en: '₨5,00,000/yr hard cap applies', ne: '₨५,००,०००/वर्ष सीमा लागू' },
  'retirement.thirdrule': { en: '1/3 rule applies', ne: '१/३ नियम लागू' },

  // SSF
  'ssf.title': { en: 'Social Security Fund', ne: 'सामाजिक सुरक्षा कोष' },
  'ssf.desc': { en: 'Employee 11% + Employer 20% — skips the 1% social-security tax', ne: 'कर्मचारी ११% + नियोक्ता २०% — १% सामाजिक सुरक्षा कर छुट' },
  'ssf.mode.label': { en: 'My salary already includes the employer 20% SSF (CTC)', ne: 'मेरो तलबमा नियोक्ताको २०% SSF पहिले नै समावेश छ (CTC)' },
  'ssf.mode.loaded': { en: 'Loaded gross — full 31% deducts from take-home (matches most offer letters)', ne: 'CTC कुल — पूर्ण ३१% हातमा आउनेबाट कट्टी हुन्छ (अधिकांश नियुक्ति पत्रसँग मेल)' },
  'ssf.mode.employee': { en: 'Employee gross — only 11% deducts; employer pays 20% on top', ne: 'कर्मचारी कुल — मात्र ११% कट्टी; नियोक्ताले २०% थप तिर्छ' },
  'ssf.employee': { en: 'Employee share (11%)', ne: 'कर्मचारी भाग (११%)' },
  'ssf.employer': { en: 'Employer share (20%)', ne: 'नियोक्ता भाग (२०%)' },
  'ssf.total': { en: 'Total to SSF (31%)', ne: 'कुल SSF (३१%)' },
  'ssf.ctc.extra': { en: 'Employer SSF (on top of gross)', ne: 'नियोक्ता SSF (कुलमाथि)' },

  // CIT
  'cit.title': { en: 'CIT Contribution', ne: 'नागरिक लगानी कोष' },
  'cit.max': { en: 'Max', ne: 'अधिकतम' },
  'cit.usemax': { en: 'Use maximum', ne: 'अधिकतम प्रयोग गर्नुहोस्' },
  'cit.paradox': { en: 'Above ₨1,25,000 gross, the ₨5L hard cap limits retirement room — earning more means less CIT space.', ne: '₨१,२५,००० भन्दा माथि, ₨५ लाख सीमाले सेवानिवृत्ति कोषमा सीमितता ल्याउँछ — बढी कमाउँदा CIT कम हुन्छ।' },

  // Filing
  'filing.title': { en: 'Filing Status', ne: 'दाखिला स्थिति' },
  'filing.single': { en: 'Single', ne: 'एकल' },
  'filing.couple': { en: 'Couple', ne: 'दम्पती' },
  'filing.tooltip': { en: 'Couple filing requires an opted-in declaration to IRD — not automatic on marriage. Choosing couple denies the female 10% rebate.', ne: 'दम्पती दाखिलाका लागि आन्तरिक राजस्व विभागमा घोषणा आवश्यक — विवाहमा स्वचालित होइन। दम्पती छान्दा महिला १०% छुट रद्द हुन्छ।' },

  // Deductions
  'deductions.title': { en: 'Tax Deductions', ne: 'कर कटौती' },
  'deductions.life': { en: 'Life Insurance', ne: 'जीवन बीमा' },
  'deductions.health': { en: 'Health Insurance', ne: 'स्वास्थ्य बीमा' },
  'deductions.building': { en: 'Building Insurance', ne: 'भवन बीमा' },
  'deductions.donation': { en: 'Donation (annual)', ne: 'दान (वार्षिक)' },
  'deductions.donation.cap': { en: 'lower of ₨1,00,000 or 5% of taxable', ne: '₨१,००,००० वा करयोग्य आयको ५% मध्ये कम' },
  'income.bonus': { en: 'Dashain / Festival Bonus (annual)', ne: 'दशैं / चाडपर्व बोनस (वार्षिक)' },
  'income.bonus.hint': { en: 'Taxable income paid once a year — legal min ≈ 1 month basic', ne: 'वर्षमा एक पटक दिइने करयोग्य आय — कानूनी न्यूनतम ≈ १ महिनाको आधारभूत' },
  'income.bonus.fill': { en: '1 month basic', ne: '१ महिना आधारभूत' },

  // Special situations
  'special.title': { en: 'Special Situations', ne: 'विशेष अवस्था' },
  'special.female': { en: 'Female Employee', ne: 'महिला कर्मचारी' },
  'special.female.desc': { en: '10% rebate on tax liability', ne: 'कर दायित्वमा १०% छुट' },
  'special.female.denied': { en: 'Not available with couple filing — female rebate forfeited', ne: 'दम्पती दाखिलामा उपलब्ध छैन — महिला छुट रद्द' },
  'special.senior': { en: 'Senior Citizen (60+)', ne: 'जेष्ठ नागरिक (६०+)' },
  'special.senior.desc': { en: 'extra exemption', ne: 'अतिरिक्त छुट' },
  'special.disability': { en: 'Disability', ne: 'अपाङ्गता' },
  'special.disability.desc': { en: 'extra exemption — certificate required', ne: 'अतिरिक्त छुट — प्रमाणपत्र आवश्यक' },
  'special.medical': { en: 'Medical Expenses', ne: 'चिकित्सा खर्च' },
  'special.medical.desc': { en: 'Rs 1,500 tax credit (Section 51) — requires receipts', ne: 'रु १,५०० कर छुट (दफा ५१) — रसिद आवश्यक' },
  'special.remote': { en: 'Remote Area Grade', ne: 'सुदूरवर्ती क्षेत्र ग्रेड' },
  'special.remote.none': { en: 'None', ne: 'कुनै पनि होइन' },

  // Output
  'output.inhand': { en: 'Monthly In-Hand', ne: 'मासिक हातमा आउने' },
  'output.annual.inhand': { en: 'Annual In-Hand', ne: 'वार्षिक हातमा आउने' },
  'output.bonus.note': { en: 'festival bonus (once a year, after tax)', ne: 'चाडपर्व बोनस (वर्षमा एक पटक, कर पछि)' },
  'output.effective': { en: 'Effective rate', ne: 'प्रभावकारी दर' },
  'output.breakdown': { en: 'Monthly Breakdown', ne: 'मासिक विवरण' },
  'output.gross': { en: 'Gross Salary', ne: 'कुल तलब' },
  'output.ssf': { en: 'SSF deduction', ne: 'सा.सु.को. कट्टी' },
  'output.cit': { en: 'CIT', ne: 'ना.ल.को.' },
  'output.tds': { en: 'Monthly TDS', ne: 'मासिक कर कट्टी' },
  'output.inhand.label': { en: 'In-Hand', ne: 'हातमा' },

  // Retirement card
  'retirement.future': { en: 'Going to your future self every month', ne: 'हरेक महिना तपाईंको भविष्यका लागि' },
  'retirement.total': { en: 'Total', ne: 'जम्मा' },

  // Slab waterfall
  'slab.title': { en: 'Tax Slab Waterfall', ne: 'कर स्ल्याब वाटरफल' },
  'slab.desc': { en: 'How your income falls across tax bands', ne: 'तपाईंको आय कर ब्यान्डमा कसरी बाँडिन्छ' },
  'slab.notaxable': { en: 'No taxable income', ne: 'करयोग्य आय छैन' },
  'slab.annual.taxable': { en: 'Annual Taxable', ne: 'वार्षिक करयोग्य' },
  'slab.annual.tax': { en: 'Annual Tax', ne: 'वार्षिक कर' },

  // Raise planner
  'raise.title': { en: 'Raise Planner', ne: 'तलब वृद्धि योजनाकार' },
  'raise.target': { en: 'Target Monthly Gross', ne: 'लक्षित मासिक कुल तलब' },
  'raise.current': { en: 'Current', ne: 'हालको' },
  'raise.target.label': { en: 'Target', ne: 'लक्षित' },
  'raise.inhand': { en: 'in-hand/mo', ne: 'हातमा/म.' },
  'raise.inhand.annual': { en: 'in-hand/yr', ne: 'हातमा/वर्ष' },
  'raise.grosspct': { en: 'Gross raise', ne: 'कुल वृद्धि' },
  'raise.delta': { en: 'In-hand delta', ne: 'हातमा फरक' },
  'raise.delta.annual': { en: 'Annual delta', ne: 'वार्षिक फरक' },
  'raise.overall.efficiency': { en: 'Raise efficiency', ne: 'वृद्धि दक्षता' },
  'raise.overall.efficiency.desc': { en: 'of your gross raise reaches your pocket', ne: 'तपाईंको कुल वृद्धिको खल्तीमा पुग्छ' },
  'raise.employer.cost': { en: 'Employer cost', ne: 'नियोक्ता लागत' },
  'raise.employer.cost.desc': { en: 'Extra CTC including employer SSF (20% of basic)', ne: 'नियोक्ता SSF (आधारभूतको २०%) सहित अतिरिक्त CTC' },
  'raise.slab.alert': { en: 'This raise pushes you into the', ne: 'यो वृद्धिले तपाईंलाई' },
  'raise.slab.alert.suffix': { en: 'tax slab', ne: 'कर स्ल्याबमा पुर्‍याउँछ' },
  'raise.goal.title': { en: 'Goal-Based Planning', ne: 'लक्ष्य-आधारित योजना' },
  'raise.goal.label': { en: 'I want this much more in-hand/mo', ne: 'मलाई प्रति महिना यति बढी चाहिन्छ' },
  'raise.goal.need': { en: 'You need a gross of', ne: 'तपाईंलाई कुल तलब चाहिन्छ' },
  'raise.goal.raise': { en: 'raise needed', ne: 'वृद्धि आवश्यक' },
  'raise.efficiency': { en: 'Marginal Efficiency', ne: 'सीमान्त दक्षता' },
  'raise.efficiency.desc': { en: 'How much of each ₨5K band reaches your pocket', ne: 'प्रत्येक ₨५K को कति तपाईंको खल्तीमा आउँछ' },
  'raise.comparison': { en: 'Side-by-Side Comparison', ne: 'तुलनात्मक विवरण' },
  'raise.delta.col': { en: 'Delta', ne: 'फरक' },

  // Insights
  'insights.skip.cit': { en: 'What if I skip CIT?', ne: 'CIT नछाडे के हुन्छ?' },
  'insights.extra.inhand': { en: 'Extra in-hand (monthly)', ne: 'अतिरिक्त हातमा (मासिक)' },
  'insights.extra.tax': { en: 'Extra tax paid (annual)', ne: 'अतिरिक्त कर (वार्षिक)' },
  'insights.subsidy': { en: 'government-subsidised', ne: 'सरकारी अनुदान' },
  'insights.saving.title': { en: 'Tax-Saving Summary', ne: 'कर बचत सारांश' },
  'insights.unclaimed': { en: 'Unclaimed — money on the table:', ne: 'दावी नगरिएको — छुटेको बचत:' },
  'insights.couldsave': { en: 'could save', ne: 'बचत हुन सक्थ्यो' },
  'insights.total.saving': { en: 'Total annual saving', ne: 'कुल वार्षिक बचत' },
  'insights.marginal': { en: 'At your marginal rate of', ne: 'तपाईंको सीमान्त दर' },

  // Foreign mode
  'foreign.title': { en: 'Foreign / Remote Employment', ne: 'वैदेशिक / रिमोट रोजगारी' },
  'foreign.info': { en: 'SSF not applicable for foreign employers. Same progressive slabs apply. Self-assessment required — no employer TDS. File by mid-October.', ne: 'वैदेशिक नियोक्ताका लागि SSF लागू हुँदैन। प्रगतिशील कर स्ल्याब लागू। स्व-मूल्याङ्कन आवश्यक। असोज अन्तिम सम्ममा दाखिला गर्नुहोस्।' },
  'foreign.gross': { en: 'Monthly Gross (NPR equivalent)', ne: 'मासिक कुल (नेरु बराबर)' },
  'foreign.country': { en: 'Country of Employment', ne: 'रोजगारीको देश' },
  'foreign.dtaa': { en: 'DTAA exists — may further reduce burden.', ne: 'DTAA अवस्थित — कर बोझ कम हुन सक्छ।' },
  'foreign.zerotax': { en: 'Zero Tax Country', ne: 'शून्य कर देश' },
  'foreign.zerotax.desc': { en: 'has 0% income tax — no foreign tax credit available. Full Nepal progressive tax applies.', ne: 'मा ०% आयकर — विदेशी कर क्रेडिट उपलब्ध छैन। पूर्ण नेपाल प्रगतिशील कर लागू।' },
  'foreign.taxpaid': { en: 'Foreign Tax Paid (annual ₨)', ne: 'विदेशमा तिरेको कर (वार्षिक ₨)' },
  'foreign.voluntary': { en: 'Voluntary', ne: 'स्वैच्छिक' },

  // Freelancer mode
  'freelancer.title': { en: 'Freelancer — Foreign Currency Income', ne: 'फ्रिल्यान्सर — विदेशी मुद्रा आय' },
  'freelancer.info': { en: 'Your bank withholds 5% automatically at the point of foreign currency transfer. No further income tax filing required. No progressive slabs. No SSF.', ne: 'तपाईंको बैंकले विदेशी मुद्रा हस्तान्तरणको बेलामा ५% स्वचालित रूपमा कट्टी गर्छ। थप आयकर दाखिला आवश्यक छैन।' },
  'freelancer.gross': { en: 'Monthly Income (NPR equivalent)', ne: 'मासिक आय (नेरु बराबर)' },

  // Non-resident mode
  'nonresident.title': { en: 'Non-Resident Taxation', ne: 'गैर-आवासीय करधन' },
  'nonresident.info1': { en: 'Below 183 days in Nepal in the fiscal year = non-resident.', ne: 'आर्थिक वर्षमा नेपालमा १८३ दिन भन्दा कम = गैर-आवासीय।' },
  'nonresident.info2': { en: 'Flat 25% on Nepal-sourced income only. No deductions apply.', ne: 'नेपालबाट प्राप्त आयमा मात्र समतल २५%। कुनै कटौती लागू हुँदैन।' },
  'nonresident.gross': { en: 'Monthly Nepal-Sourced Income', ne: 'मासिक नेपाल स्रोत आय' },

  // Common
  'common.monthly.tax': { en: 'Monthly Tax', ne: 'मासिक कर' },
  'common.annual.tax': { en: 'Annual Tax', ne: 'वार्षिक कर' },
  'common.effective.rate': { en: 'Effective Rate', ne: 'प्रभावकारी दर' },
  'common.yr': { en: '/yr', ne: '/वर्ष' },
  'common.mo': { en: '/mo', ne: '/महिना' },
  'common.cap': { en: 'cap', ne: 'सीमा' },
  'common.upto': { en: 'Up to', ne: 'सम्म' },

  // Footer
  'footer.disclaimer': { en: 'For estimation only. Consult a registered tax professional for filing.', ne: 'अनुमानका लागि मात्र। दाखिलाका लागि दर्ता भएको कर पेशेवरसँग परामर्श गर्नुहोस्।' },

  // Theme
  'theme.light': { en: 'Light', ne: 'उज्यालो' },
  'theme.dark': { en: 'Dark', ne: 'अँध्यारो' },
  'lang.toggle': { en: 'नेपाली', ne: 'English' },
} as const

export type TranslationKey = keyof typeof translations

export function t(key: TranslationKey, lang: Lang): string {
  return translations[key]?.[lang] ?? key
}

export const allTranslations = translations
