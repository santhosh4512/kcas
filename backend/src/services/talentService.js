/**
 * Talent Intelligence Calculation Service
 * Deterministic talent score calculation, primary/secondary ranking,
 * joint-strength tie resolution, and dynamic suggestions & summary generation.
 */

const CATEGORY_MAP = {
  studies: 'Studies / Academic',
  sports: 'Sports',
  silambam: 'Silambam',
  dance: 'Dance',
  cultural: 'Cultural / Arts',
  technical: 'Coding / Technical',
  communication: 'Communication',
  leadership: 'Leadership',
  other: 'Other Skills',
};

const SUGGESTIONS_MAP = {
  silambam: [
    'Advanced traditional weapon rotation & sparring masterclasses',
    'State & National Level Silambam Championship participation',
    'Inter-collegiate traditional martial arts exhibitions',
    'Student coach and leadership roles in college sports & martial arts club',
  ],
  sports: [
    'Inter-university tournament representation & athletic coaching',
    'High-performance physical conditioning & sports science workshops',
    'College sports council leadership & team captaincy',
    'Officiating and referee state certification training',
  ],
  dance: [
    'Inter-college youth festival representation & dance competitions',
    'Choreography & cultural event direction for institutional summits',
    'State level classical / folk dance performance opportunities',
    'Fine arts & cultural committee lead',
  ],
  cultural: [
    'University cultural fest representation in music, drama & fine arts',
    'Department fest creative design & stage production coordination',
    'Inter-collegiate arts exhibitions and workshop mentoring',
    'Cultural secretary opportunities in student union',
  ],
  technical: [
    'Hackathon & competitive coding bootcamps',
    'Open source cloud software and full-stack project contributions',
    'Industry internship readiness & technical paper publications',
    'Technical symposium lead & peer coding mentorship',
  ],
  studies: [
    'University Gold Medal track preparation & academic honors program',
    'Undergraduate research paper publication in indexed journals',
    'Peer tutoring, seminar chair & departmental symposium presenting',
    'National level competitive exam coaching (NET/SET/GATE/UPSC)',
  ],
  communication: [
    'Inter-college debate, Model UN & elocution championships',
    'Master of Ceremonies (MC) for institutional conferences & summits',
    'College editorial board, press release & public relations lead',
    'Toastmasters International public speaking certification',
  ],
  leadership: [
    'Student council executive candidacy & department representative',
    'Department national conference convener & coordinator',
    'Community outreach, NSS & social impact initiative lead',
    'Campus event management & institutional delegation leadership',
  ],
  other: [
    'Vocational skill specialization & master artisan mentorship',
    'Entrepreneurship development cell (EDC) incubation project',
    'Creative workshop facilitation & community skill training',
    'Multi-disciplinary creative portfolio development',
  ],
};

/**
 * Calculate student talent rankings, primary talent, secondary strength, and development suggestions
 * @param {Object} rawScores - { studies, sports, silambam, dance, cultural, technical, communication, leadership, other }
 * @param {String} studentName - Student's full name for summary synthesis
 * @returns {Object} Calculated talent breakdown
 */
function calculateTalentScores(rawScores = {}, studentName = 'The student') {
  const categories = Object.keys(CATEGORY_MAP);
  
  // 1. Validate and normalize every score 0-100
  const normalizedScores = {};
  const scoreList = [];

  for (const cat of categories) {
    const rawVal = Number(rawScores[cat]);
    const cleanScore = isNaN(rawVal) ? 0 : Math.min(100, Math.max(0, Math.round(rawVal)));
    normalizedScores[cat] = cleanScore;
    scoreList.push({
      category: cat,
      displayName: CATEGORY_MAP[cat],
      score: cleanScore,
    });
  }

  // 2. Sort descending by score
  scoreList.sort((a, b) => b.score - a.score);

  // 3. Assign ranks
  let currentRank = 1;
  for (let i = 0; i < scoreList.length; i++) {
    if (i > 0 && scoreList[i].score < scoreList[i - 1].score) {
      currentRank = i + 1;
    }
    scoreList[i].rank = currentRank;
  }

  // 4. Identify Primary Talent (Rank 1) - can be multiple if tied
  const highestScore = scoreList[0]?.score || 0;
  const primaryTalent = scoreList.filter((item) => item.score === highestScore && highestScore > 0);
  const isJointHighest = primaryTalent.length > 1;

  // 5. Identify Secondary Strength (Next distinct highest score)
  const lowerScores = scoreList.filter((item) => item.score < highestScore && item.score > 0);
  const secondHighestScore = lowerScores.length > 0 ? lowerScores[0].score : 0;
  const secondaryStrength = lowerScores.filter((item) => item.score === secondHighestScore);

  // Dominant category name for fast indexing/grouping
  const dominantCategoryName = primaryTalent.length > 0 
    ? (primaryTalent.map(p => p.displayName).join(' & '))
    : 'Not Evaluated';

  // 6. Generate Development Suggestions based on primary & secondary strengths
  let suggestions = [];
  primaryTalent.forEach((p) => {
    if (SUGGESTIONS_MAP[p.category]) {
      suggestions = suggestions.concat(SUGGESTIONS_MAP[p.category]);
    }
  });

  if (suggestions.length === 0 && secondaryStrength.length > 0) {
    secondaryStrength.forEach((s) => {
      if (SUGGESTIONS_MAP[s.category]) {
        suggestions = suggestions.concat(SUGGESTIONS_MAP[s.category]);
      }
    });
  }

  // Deduplicate suggestions and take top 4
  suggestions = Array.from(new Set(suggestions)).slice(0, 4);
  if (suggestions.length === 0) {
    suggestions = [
      'Participate in departmental workshops and skill-building bootcamps',
      'Engage in peer-mentored academic and extracurricular activities',
      'Identify personal passion areas with faculty mentor guidance',
    ];
  }

  // 7. Synthesize Natural Language Summary
  let calculatedSummary = '';
  if (highestScore === 0) {
    calculatedSummary = `${studentName}'s talent profile is awaiting initial assessment. No category scores recorded yet.`;
  } else if (isJointHighest) {
    const jointNames = primaryTalent.map((p) => `${p.displayName} (${p.score}%)`).join(' and ');
    calculatedSummary = `${studentName} exhibits exceptional dual talent, jointly excelling in ${jointNames} with matching top scores of ${highestScore}%.`;
    if (secondaryStrength.length > 0) {
      const secNames = secondaryStrength.map((s) => `${s.displayName} (${s.score}%)`).join(' and ');
      calculatedSummary += ` Her subsequent strength is ${secNames}.`;
    }
  } else {
    const prim = primaryTalent[0];
    calculatedSummary = `${studentName}'s strongest performance area is ${prim.displayName} with an outstanding score of ${prim.score}%.`;
    if (secondaryStrength.length > 0) {
      const sec = secondaryStrength[0];
      calculatedSummary += ` Her secondary strength is ${sec.displayName} with a score of ${sec.score}%.`;
    }
  }

  return {
    categoryScores: normalizedScores,
    rankedCategories: scoreList,
    primaryTalent: primaryTalent.length > 0 ? primaryTalent : [{ category: 'none', displayName: 'None', score: 0 }],
    secondaryStrength: secondaryStrength.length > 0 ? secondaryStrength : [{ category: 'none', displayName: 'None', score: 0 }],
    highestScore,
    dominantCategoryName,
    isJointHighest,
    suggestions,
    calculatedSummary,
  };
}

/**
 * Calculate Department Talent Analytics
 * @param {Array} studentTalents - Array of TalentScore documents
 * @param {Object} contextInfo - Optional department/course context info
 * @returns {Object} Analytics aggregation and summary
 */
function calculateDepartmentAnalytics(studentTalents = [], contextInfo = {}) {
  const totalStudents = studentTalents.length;
  
  const categoryCounts = {
    'Studies / Academic': 0,
    'Sports': 0,
    'Silambam': 0,
    'Dance': 0,
    'Cultural / Arts': 0,
    'Coding / Technical': 0,
    'Communication': 0,
    'Leadership': 0,
    'Other Skills': 0,
    'Joint Strengths': 0,
  };

  const categoryAverageScores = {
    studies: 0,
    sports: 0,
    silambam: 0,
    dance: 0,
    cultural: 0,
    technical: 0,
    communication: 0,
    leadership: 0,
    other: 0,
  };

  let totalSumScores = {
    studies: 0,
    sports: 0,
    silambam: 0,
    dance: 0,
    cultural: 0,
    technical: 0,
    communication: 0,
    leadership: 0,
    other: 0,
  };

  studentTalents.forEach((talent) => {
    if (talent.categoryScores) {
      Object.keys(categoryAverageScores).forEach((k) => {
        totalSumScores[k] += Number(talent.categoryScores[k] || 0);
      });
    }

    if (talent.isJointHighest) {
      categoryCounts['Joint Strengths']++;
    } else if (talent.primaryTalent && talent.primaryTalent[0] && talent.primaryTalent[0].displayName) {
      const catName = talent.primaryTalent[0].displayName;
      if (categoryCounts[catName] !== undefined) {
        categoryCounts[catName]++;
      } else {
        categoryCounts['Other Skills']++;
      }
    }
  });

  // Calculate Averages
  if (totalStudents > 0) {
    Object.keys(categoryAverageScores).forEach((k) => {
      categoryAverageScores[k] = Math.round((totalSumScores[k] / totalStudents) * 10) / 10;
    });
  }

  // Calculate Distribution array
  const distribution = Object.keys(categoryCounts)
    .filter(name => name !== 'Joint Strengths')
    .map((name) => {
      const count = categoryCounts[name] || 0;
      const percentage = totalStudents > 0 ? Math.round((count / totalStudents) * 1000) / 10 : 0;
      return {
        category: name,
        count,
        percentage,
      };
    });

  // Sort distribution descending by student count
  distribution.sort((a, b) => b.count - a.count);

  // Determine Dominant Talent
  const dominantTalent = distribution[0] && distribution[0].count > 0 
    ? distribution[0].category 
    : 'Balanced';
  const dominantPercentage = distribution[0] && distribution[0].count > 0 
    ? distribution[0].percentage 
    : 0;
  const dominantCount = distribution[0] && distribution[0].count > 0 
    ? distribution[0].count 
    : 0;

  // Generate dynamic department summary
  let groupSummary = '';
  const groupLabel = contextInfo.deptName || 'selected student cohort';

  if (totalStudents === 0) {
    groupSummary = `No evaluated students found in the ${groupLabel}. Please assess student talent scores to generate analytics.`;
  } else if (dominantCount === 0) {
    groupSummary = `Talent assessment data for ${totalStudents} students in ${groupLabel} is pending.`;
  } else {
    groupSummary = `${dominantTalent} is the dominant talent category in this ${groupLabel}, with ${dominantPercentage}% (${dominantCount} out of ${totalStudents}) of students identifying ${dominantTalent} as their highest-performing field.`;
  }

  return {
    totalStudents,
    distribution,
    jointStrengthsCount: categoryCounts['Joint Strengths'],
    dominantTalent,
    dominantPercentage,
    dominantCount,
    categoryAverageScores,
    groupSummary,
  };
}

module.exports = {
  CATEGORY_MAP,
  SUGGESTIONS_MAP,
  calculateTalentScores,
  calculateDepartmentAnalytics,
};
