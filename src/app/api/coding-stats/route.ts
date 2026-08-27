import { NextResponse } from "next/server";
import { checkRateLimit } from "@/app/lib/moderation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Rate limiting protection (Max 60 requests/min per IP)
  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  const rateLimit = checkRateLimit(`coding_stats_${clientIp}`, 60, 60000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  const queryParams = new URL(request.url).searchParams;
  const platform = queryParams.get("platform");
  const username = queryParams.get("username");
  const yearParam = queryParams.get("year");

  if (!platform || !username) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const cleanUsername = username.trim();
  const currentYear = yearParam ? parseInt(yearParam) : new Date().getFullYear();

  try {
    if (platform === "leetcode") {
      // 1. Fetch Profile Stats + Recent Submissions + Daily Challenge Question (Bypass cache completely)
      let statsData: any = null;
      try {
        const statsResponse = await fetch(`https://leetcode.com/graphql?t=${Date.now()}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://leetcode.com/",
            "Origin": "https://leetcode.com"
          },
          body: JSON.stringify({
            query: `
              query userProblemsSolved($username: String!) {
                matchedUser(username: $username) {
                  submitStatsGlobal {
                    acSubmissionNum {
                      difficulty
                      count
                      submissions
                    }
                    totalSubmissionNum {
                      difficulty
                      count
                      submissions
                    }
                  }
                  profile {
                    ranking
                  }
                }
                userContestRanking(username: $username) {
                  rating
                }
                recentAcSubmissionList(username: $username, limit: 100) {
                  title
                  titleSlug
                  timestamp
                }
                activeDailyCodingChallengeQuestion {
                  date
                  link
                  question {
                    questionId
                    questionFrontendId
                    title
                    titleSlug
                    difficulty
                  }
                }
              }
            `,
            variables: { username: cleanUsername },
          }),
          cache: "no-store"
        });

        if (statsResponse.ok) {
          statsData = await statsResponse.json();
        }
      } catch (e) {
        console.error("Failed to fetch LeetCode stats", e);
      }

      const matchedUser = statsData?.data?.matchedUser;
      const dailyChallengeData = statsData?.data?.activeDailyCodingChallengeQuestion;

      if (!matchedUser) {
        // Try secondary failsafe public API backup if LeetCode GraphQL is blocked
        try {
          const backupRes = await fetch(`https://leetcode-stats-api.herokuapp.com/${cleanUsername}`, {
            cache: "no-store"
          });
          if (backupRes.ok) {
            const bData = await backupRes.json();
            if (bData.status === "success") {
              return NextResponse.json({
                platform: "leetcode",
                username: cleanUsername,
                solved: bData.totalSolved || 0,
                solvedEasy: bData.easySolved || 0,
                solvedMedium: bData.mediumSolved || 0,
                solvedHard: bData.hardSolved || 0,
                totalSolved: bData.totalSolved || 0,
                easySolved: bData.easySolved || 0,
                mediumSolved: bData.mediumSolved || 0,
                hardSolved: bData.hardSolved || 0,
                totalSubmissions: bData.totalQuestions || 0,
                acceptedSubmissions: bData.totalSolved || 0,
                rank: bData.ranking ? `Top ${Math.max(1, Math.round((bData.ranking / 500000) * 100))}%` : "Top 15%",
                rating: 1500,
                globalRank: bData.ranking || 0,
                leetcodeStreak: 1,
                submissionCalendar: bData.submissionCalendar || {},
                submissionCalendarPrivate: false,
                dailyChallenge: {
                  title: dailyChallengeData?.question?.title || "Daily Coding Challenge",
                  link: dailyChallengeData?.link ? `https://leetcode.com${dailyChallengeData.link}` : "https://leetcode.com/problemset/all/",
                  difficulty: dailyChallengeData?.question?.difficulty || "Medium",
                  date: dailyChallengeData?.date || new Date().toISOString().split("T")[0],
                  completed: false
                }
              });
            }
          }
        } catch (bErr) {
          console.warn("LeetCode secondary backup fetch error:", bErr);
        }

        // Try tertiary alfa-leetcode-api backup proxy
        try {
          const alfaRes = await fetch(`https://alfa-leetcode-api.onrender.com/userProfile/${cleanUsername}`, {
            cache: "no-store"
          });
          if (alfaRes.ok) {
            const aData = await alfaRes.json();
            if (aData && (aData.totalSolved !== undefined || aData.easySolved !== undefined)) {
              return NextResponse.json({
                platform: "leetcode",
                username: cleanUsername,
                solved: aData.totalSolved || 0,
                solvedEasy: aData.easySolved || 0,
                solvedMedium: aData.mediumSolved || 0,
                solvedHard: aData.hardSolved || 0,
                totalSolved: aData.totalSolved || 0,
                easySolved: aData.easySolved || 0,
                mediumSolved: aData.mediumSolved || 0,
                hardSolved: aData.hardSolved || 0,
                totalSubmissions: aData.totalQuestions || 0,
                acceptedSubmissions: aData.totalSolved || 0,
                rank: aData.ranking ? `Top ${Math.max(1, Math.round((aData.ranking / 500000) * 100))}%` : "Top 15%",
                rating: 1500,
                globalRank: aData.ranking || 0,
                leetcodeStreak: 1,
                submissionCalendar: aData.submissionCalendar || {},
                submissionCalendarPrivate: false,
                dailyChallenge: {
                  title: "Daily Coding Challenge",
                  link: "https://leetcode.com/problemset/all/",
                  difficulty: "Medium",
                  date: new Date().toISOString().split("T")[0],
                  completed: false
                }
              });
            }
          }
        } catch (aErr) {
          console.warn("LeetCode alfa backup fetch error:", aErr);
        }

        // Circuit Breaker: Return 200 OK with graceful fallback state instead of 502 Bad Gateway
        return NextResponse.json({
          platform: "leetcode",
          username: cleanUsername,
          solved: 0,
          solvedEasy: 0,
          solvedMedium: 0,
          solvedHard: 0,
          totalSolved: 0,
          easySolved: 0,
          mediumSolved: 0,
          hardSolved: 0,
          totalSubmissions: 0,
          acceptedSubmissions: 0,
          rank: "Top 25%",
          rating: 1500,
          globalRank: 0,
          leetcodeStreak: 0,
          submissionCalendar: {},
          submissionCalendarPrivate: false,
          isFallback: true,
          dailyChallenge: {
            title: "Daily Coding Challenge",
            link: "https://leetcode.com/problemset/all/",
            difficulty: "Medium",
            date: new Date().toISOString().split("T")[0],
            completed: false
          }
        }, { status: 200 });
      }

      const submissions = matchedUser.submitStatsGlobal?.acSubmissionNum || [];
      const totalSubmissionsList = matchedUser.submitStatsGlobal?.totalSubmissionNum || [];
      
      const solved = submissions.find((s: any) => s.difficulty === "All")?.count || 0;
      const solvedEasy = submissions.find((s: any) => s.difficulty === "Easy")?.count || 0;
      const solvedMedium = submissions.find((s: any) => s.difficulty === "Medium")?.count || 0;
      const solvedHard = submissions.find((s: any) => s.difficulty === "Hard")?.count || 0;
      
      const totalSubmissions = totalSubmissionsList.find((s: any) => s.difficulty === "All")?.submissions || 0;
      const totalEasySubmissions = totalSubmissionsList.find((s: any) => s.difficulty === "Easy")?.submissions || 0;
      const totalMediumSubmissions = totalSubmissionsList.find((s: any) => s.difficulty === "Medium")?.submissions || 0;
      const totalHardSubmissions = totalSubmissionsList.find((s: any) => s.difficulty === "Hard")?.submissions || 0;
      
      const acceptedSubmissions = submissions.find((s: any) => s.difficulty === "All")?.submissions || 0;
      const acceptedEasySubmissions = submissions.find((s: any) => s.difficulty === "Easy")?.submissions || 0;
      const acceptedMediumSubmissions = submissions.find((s: any) => s.difficulty === "Medium")?.submissions || 0;
      const acceptedHardSubmissions = submissions.find((s: any) => s.difficulty === "Hard")?.submissions || 0;

      const rating = Math.round(statsData.data?.userContestRanking?.rating || 1500);
      const globalRank = matchedUser.profile?.ranking || 0;

      let rank = "Top 25%";
      if (globalRank > 0) {
        if (globalRank < 1000) rank = "Top 0.1%";
        else if (globalRank < 10000) rank = "Top 1%";
        else if (globalRank < 50000) rank = "Top 5%";
        else if (globalRank < 150000) rank = "Top 10%";
      }

      const recentSubmissions = statsData?.data?.recentAcSubmissionList || [];
      
      let dailyChallengeCompleted = false;
      let dailyChallengeInfo = null;
      
      if (dailyChallengeData) {
        const dailyDate = dailyChallengeData.date; // e.g. "2026-08-21"
        const rawDailySlug = dailyChallengeData.question?.titleSlug || "";
        const rawDailyTitle = dailyChallengeData.question?.title || "";
        const normDailySlug = rawDailySlug.toLowerCase().replace(/[^a-z0-9]/g, "");
        const normDailyTitle = rawDailyTitle.toLowerCase().replace(/[^a-z0-9]/g, "");

        const nowMs = Date.now();
        const todayUTC = new Date().toISOString().split("T")[0];
        const todayLocal = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`;
        
        // Check if exact daily challenge problem was solved (within rolling 32-hour window or matching date)
        const hasSolvedExactDaily = recentSubmissions.some((sub: any) => {
          const subSlug = (sub.titleSlug || "").toLowerCase().replace(/[^a-z0-9]/g, "");
          const subTitle = (sub.title || "").toLowerCase().replace(/[^a-z0-9]/g, "");
          
          const matchSlug = subSlug && normDailySlug && (subSlug === normDailySlug || subSlug.includes(normDailySlug) || normDailySlug.includes(subSlug));
          const matchTitle = subTitle && normDailyTitle && (subTitle === normDailyTitle || subTitle.includes(normDailyTitle) || normDailyTitle.includes(subTitle));
          if (!matchSlug && !matchTitle) return false;
          
          const subTimeMs = parseInt(sub.timestamp) * 1000;
          if (isNaN(subTimeMs)) return false;

          const diffHours = (nowMs - subTimeMs) / (1000 * 60 * 60);
          // If solved within the last 32 hours, it counts as today's active window across all timezones
          if (diffHours >= 0 && diffHours <= 32) return true;

          const subDate = new Date(subTimeMs);
          const subDateKeyUTC = `${subDate.getUTCFullYear()}-${String(subDate.getUTCMonth() + 1).padStart(2, "0")}-${String(subDate.getUTCDate()).padStart(2, "0")}`;
          const subDateKeyLocal = `${subDate.getFullYear()}-${String(subDate.getMonth() + 1).padStart(2, "0")}-${String(subDate.getDate()).padStart(2, "0")}`;
          
          return subDateKeyUTC === dailyDate || subDateKeyLocal === dailyDate || subDateKeyUTC === todayUTC || subDateKeyLocal === todayLocal;
        });

        // Check if ANY problem was solved today across rolling 32h window or today's date
        const hasSolvedAnyToday = recentSubmissions.some((sub: any) => {
          const subTimeMs = parseInt(sub.timestamp) * 1000;
          if (isNaN(subTimeMs)) return false;
          const diffHours = (nowMs - subTimeMs) / (1000 * 60 * 60);
          if (diffHours >= 0 && diffHours <= 32) return true;
          const subDate = new Date(subTimeMs);
          const subDateKeyUTC = `${subDate.getUTCFullYear()}-${String(subDate.getUTCMonth() + 1).padStart(2, "0")}-${String(subDate.getUTCDate()).padStart(2, "0")}`;
          const subDateKeyLocal = `${subDate.getFullYear()}-${String(subDate.getMonth() + 1).padStart(2, "0")}-${String(subDate.getDate()).padStart(2, "0")}`;
          return subDateKeyUTC === todayUTC || subDateKeyLocal === todayLocal;
        });

        dailyChallengeCompleted = hasSolvedExactDaily;
        dailyChallengeInfo = {
          title: dailyChallengeData.question?.title,
          link: `https://leetcode.com${dailyChallengeData.link}`,
          difficulty: dailyChallengeData.question?.difficulty,
          date: dailyChallengeData.date,
          completed: dailyChallengeCompleted,
          hasSolvedToday: hasSolvedAnyToday || hasSolvedExactDaily,
          isStreakMaintained: hasSolvedAnyToday || hasSolvedExactDaily
        };
      }

      // 2. Fetch Calendar separately (failsafe, bypass cache)
      const submissionCalendar: Record<string, number> = {};
      let submissionCalendarPrivate = false;
      let leetcodeStreak = 0;
      let activeYears: number[] = [];
      try {
        const calResponse = await fetch(`https://leetcode.com/graphql?t=${Date.now()}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
          body: JSON.stringify({
            query: `
              query userCalendar($username: String!, $year: Int!) {
                matchedUser(username: $username) {
                  userCalendar(year: $year) {
                    activeYears
                    streak
                    submissionCalendar
                  }
                }
              }
            `,
            variables: { username: cleanUsername, year: currentYear },
          }),
          cache: "no-store"
        });

        if (calResponse.ok) {
          const calData = await calResponse.json();
          if (calData?.errors?.some((e: any) => e.message?.includes("permission") || e.message?.includes("calendar"))) {
            submissionCalendarPrivate = true;
          }
          const userCal = calData?.data?.matchedUser?.userCalendar;
          if (userCal) {
            activeYears = userCal.activeYears || [];
            if (userCal.streak && typeof userCal.streak === "number") {
              leetcodeStreak = userCal.streak;
            }
            const rawCalStr = userCal.submissionCalendar;
            if (rawCalStr) {
              const rawCal = JSON.parse(rawCalStr);
              Object.entries(rawCal).forEach(([timestamp, count]) => {
                const date = new Date(parseInt(timestamp) * 1000);
                const dateKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
                submissionCalendar[dateKey] = (submissionCalendar[dateKey] || 0) + (count as number);
              });

              // Dynamic consecutive streak calculation using UTC coordinates
              let dynamicStreak = 0;
              const checkDate = new Date();
              const todayKey = `${checkDate.getUTCFullYear()}-${String(checkDate.getUTCMonth() + 1).padStart(2, "0")}-${String(checkDate.getUTCDate()).padStart(2, "0")}`;
              if (!submissionCalendar[todayKey]) {
                checkDate.setUTCDate(checkDate.getUTCDate() - 1);
              }
              while (true) {
                const key = `${checkDate.getUTCFullYear()}-${String(checkDate.getUTCMonth() + 1).padStart(2, "0")}-${String(checkDate.getUTCDate()).padStart(2, "0")}`;
                if (submissionCalendar[key] && submissionCalendar[key] > 0) {
                  dynamicStreak++;
                  checkDate.setUTCDate(checkDate.getUTCDate() - 1);
                } else {
                  break;
                }
              }
              if (dynamicStreak > 0) {
                leetcodeStreak = dynamicStreak;
              }
            }
          }
        }

        // Calculate DCC Badge Streak dynamically using dailyCodingChallengeV2
        try {
          const today = new Date();
          const currentYearVal = today.getFullYear();
          const currentMonthVal = today.getMonth() + 1;

          // try catch error handling safeguard
          const dccResponse = await fetch(`https://leetcode.com/graphql?t=${Date.now()}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
            body: JSON.stringify({
              query: `
                query dailyCodingChallengeV2($year: Int!, $month: Int!) {
                  dailyCodingChallengeV2(year: $year, month: $month) {
                    challenges {
                      date
                      question {
                        titleSlug
                      }
                    }
                  }
                }
              `,
              variables: { year: currentYearVal, month: currentMonthVal }
            }),
            cache: "no-store"
          });

          if (dccResponse.ok) {
            const dccData = await dccResponse.json();
            const challenges = dccData?.data?.dailyCodingChallengeV2?.challenges || [];

            // If early in the month, fetch previous month's daily challenges as well to support cross-month streaks
            if (today.getDate() <= 10) {
              const prevMonth = currentMonthVal === 1 ? 12 : currentMonthVal - 1;
              const prevYear = currentMonthVal === 1 ? currentYearVal - 1 : currentYearVal;
              try {
                const prevDccResponse = await fetch(`https://leetcode.com/graphql?t=${Date.now()}`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                  },
                  body: JSON.stringify({
                    query: `
                      query dailyCodingChallengeV2($year: Int!, $month: Int!) {
                        dailyCodingChallengeV2(year: $year, month: $month) {
                          challenges {
                            date
                            question {
                              titleSlug
                            }
                          }
                        }
                      }
                    `,
                    variables: { year: prevYear, month: prevMonth }
                  }),
                  cache: "no-store"
                });

                if (prevDccResponse.ok) {
                  const prevDccData = await prevDccResponse.json();
                  const prevChallenges = prevDccData?.data?.dailyCodingChallengeV2?.challenges || [];
                  challenges.unshift(...prevChallenges);
                }
              } catch (prevErr) {
                console.warn("Previous month DCC fetch failed:", prevErr);
              }
            }

            const challengeMap: Record<string, string> = {};
            challenges.forEach((c: any) => {
              challengeMap[c.date] = c.question?.titleSlug;
            });

            const getFormattedDateStr = (d: Date) =>
              `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;

            const isChallengeSolvedOnDate = (dateKey: string) => {
              const slug = challengeMap[dateKey];
              if (!slug) return false;
              return recentSubmissions.some((sub: any) => {
                if (sub.titleSlug !== slug) return false;
                const subDate = new Date(parseInt(sub.timestamp) * 1000);
                return getFormattedDateStr(subDate) === dateKey;
              });
            };

            // Initialize checkDate with UTC coordinates to align with UTC reset boundaries
            const checkDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
            const todayStr = getFormattedDateStr(checkDate);

            let streakVal = 0;
            if (isChallengeSolvedOnDate(todayStr)) {
              streakVal = 1;
            }

            checkDate.setUTCDate(checkDate.getUTCDate() - 1);

            while (true) {
              const dateStr = getFormattedDateStr(checkDate);
              if (!challengeMap[dateStr]) {
                break;
              }
              if (isChallengeSolvedOnDate(dateStr)) {
                streakVal++;
                checkDate.setUTCDate(checkDate.getUTCDate() - 1);
              } else {
                break;
              }
            }
            leetcodeStreak = Math.max(leetcodeStreak || 0, streakVal);
          }
        } catch (dccErr) {
          console.warn("Failed to calculate DCC badge streak dynamically", dccErr);
        }
      } catch (e) {
        console.warn("Failed to parse LeetCode calendar (permission restricted or private calendar)", e);
      }

      return NextResponse.json({
        solved,
        solvedEasy,
        solvedMedium,
        solvedHard,
        totalSubmissions,
        totalEasySubmissions,
        totalMediumSubmissions,
        totalHardSubmissions,
        acceptedSubmissions,
        acceptedEasySubmissions,
        acceptedMediumSubmissions,
        acceptedHardSubmissions,
        rank,
        rating,
        globalRank,
        leetcodeStreak,
        activeYears,
        submissionCalendar,
        submissionCalendarPrivate,
        hasSolvedToday: Boolean(dailyChallengeInfo?.hasSolvedToday),
        isStreakMaintained: Boolean(dailyChallengeInfo?.isStreakMaintained),
        dailyChallenge: dailyChallengeInfo
      });
    }

    if (platform === "codeforces") {
      let infoRes: Response;
      try {
        infoRes = await fetch(`https://codeforces.com/api/user.info?handles=${cleanUsername}&t=${Date.now()}`, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
          cache: "no-store"
        });
      } catch {
        return NextResponse.json({
          solved: 0,
          solvedEasy: 0,
          solvedMedium: 0,
          solvedHard: 0,
          totalSubmissions: 0,
          acceptedSubmissions: 0,
          rank: "Unregistered",
          rating: 1200,
          globalRank: 1200,
          submissionCalendar: {},
          error: "Codeforces connection timeout"
        });
      }
      if (!infoRes.ok) {
        return NextResponse.json({
          solved: 0,
          solvedEasy: 0,
          solvedMedium: 0,
          solvedHard: 0,
          totalSubmissions: 0,
          acceptedSubmissions: 0,
          rank: "Not Found",
          rating: 1200,
          globalRank: 1200,
          submissionCalendar: {},
          notFound: true
        });
      }

      const infoData = await infoRes.json();
      if (infoData.status !== "OK" || !infoData.result?.[0]) {
        return NextResponse.json({
          solved: 0,
          solvedEasy: 0,
          solvedMedium: 0,
          solvedHard: 0,
          totalSubmissions: 0,
          acceptedSubmissions: 0,
          rank: "Not Found",
          rating: 1200,
          globalRank: 1200,
          submissionCalendar: {},
          notFound: true
        });
      }

      const userInfo = infoData.result[0];

      let solved = 0;
      let totalSubmissions = 0;
      let acceptedSubmissionsCount = 0;
      const submissionCalendar: Record<string, number> = {};
      
      try {
        const statusRes = await fetch(`https://codeforces.com/api/user.status?handle=${cleanUsername}&t=${Date.now()}`, {
          cache: "no-store"
        });
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          if (statusData.status === "OK") {
            totalSubmissions = statusData.result.length;
            const uniqueSolved = new Set();
            statusData.result.forEach((sub: any) => {
              if (sub.verdict === "OK") {
                acceptedSubmissionsCount++;
                if (sub.problem) {
                  uniqueSolved.add(`${sub.problem.contestId}-${sub.problem.index}`);
                }
              }
              if (sub.creationTimeSeconds) {
                const date = new Date(sub.creationTimeSeconds * 1000);
                const dateKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
                submissionCalendar[dateKey] = (submissionCalendar[dateKey] || 0) + 1;
              }
            });
            solved = uniqueSolved.size;
          }
        }
      } catch (e) {
        console.warn("CF submissions load failed", e);
      }

      const rating = userInfo.rating || 1200;
      const rank = userInfo.rank ? userInfo.rank.charAt(0).toUpperCase() + userInfo.rank.slice(1) : "Newbie";

      return NextResponse.json({
        solved,
        solvedEasy: 0,
        solvedMedium: 0,
        solvedHard: 0,
        totalSubmissions,
        acceptedSubmissions: acceptedSubmissionsCount,
        rank,
        rating,
        globalRank: userInfo.maxRating || 1200,
        submissionCalendar
      });
    }

    if (platform === "codechef") {
      let rating = 0;
      let rank = "1★";
      let solved = 0;
      let highestRating = 0;
      let globalRank = 0;
      let countryRank = 0;
      let fetchedSuccessfully = false;

      // Method 1: Try public CodeChef API endpoint first
      try {
        const apiRes = await fetch(`https://codechef-api.vercel.app/handle/${cleanUsername}`, {
          cache: "no-store"
        });
        if (apiRes.ok) {
          const apiData = await apiRes.json();
          if (apiData.currentRating || apiData.rating) {
            rating = parseInt(apiData.currentRating || apiData.rating || 0);
            const stars = apiData.stars || apiData.ratingStar;
            rank = stars ? (String(stars).includes("★") ? String(stars) : `${stars}★`) : "1★";
            solved = parseInt(apiData.totalSolved || apiData.fullySolved?.count || 0);
            highestRating = parseInt(apiData.highestRating || rating);
            globalRank = parseInt(apiData.globalRank || 0);
            countryRank = parseInt(apiData.countryRank || 0);
            if (rating > 0) fetchedSuccessfully = true;
          }
        }
      } catch (err) {
        console.warn("CodeChef API fallback failed:", err);
      }

      // Method 2: Direct HTML scraping with realistic browser headers
      if (!fetchedSuccessfully || rating === 0) {
        try {
          const response = await fetch(`https://www.codechef.com/users/${cleanUsername}?t=${Date.now()}`, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
              "Accept-Language": "en-US,en;q=0.9",
              "Referer": "https://www.codechef.com/"
            },
            cache: "no-store"
          });

          if (response.ok) {
            const html = await response.text();

            // Extract rating: 1) Try exact rating-number HTML DOM block first
            const ratingHeaderMatch = html.match(/rating-number[^>]*>\s*(\d+)/i) ||
                                html.match(/class="rating-number"[^>]*>\s*(\d+)/i);
            if (ratingHeaderMatch) {
              rating = parseInt(ratingHeaderMatch[1]);
            } else {
              // 2) Try embedded contest JSON array (last element = current active rating)
              const ratingAllMatch = html.match(/"rating"\s*:\s*\{\s*"all"\s*:\s*(\[[\s\S]*?\])/);
              if (ratingAllMatch) {
                try {
                  const contestList = JSON.parse(ratingAllMatch[1]);
                  if (Array.isArray(contestList) && contestList.length > 0) {
                    const latest = contestList[contestList.length - 1];
                    if (latest?.rating) rating = parseInt(latest.rating);
                  }
                } catch {}
              }
            }

            // Extract highest rating
            const highestMatch = html.match(/\(Highest Rating\s*(\d+)\)/i) ||
                                 html.match(/Highest Rating\s*(\d+)/i) ||
                                 html.match(/"highestRating":\s*(\d+)/);
            if (highestMatch) highestRating = parseInt(highestMatch[1]);
            if (!highestRating) highestRating = rating;

            // Extract stars
            const starsMatch = html.match(/(\d+)★/) || html.match(/(\d+)\s*★/);
            if (starsMatch) rank = `${starsMatch[1]}★`;

            // Extract problems solved
            const solvedMatch = html.match(/Total Problems Solved:\s*(\d+)/i) ||
                                html.match(/Fully Solved\s*\((\d+)\)/i) || 
                                html.match(/Fully Solved[\s\S]*?(\d+)/i);
            if (solvedMatch) solved = parseInt(solvedMatch[1]);

            // Extract global rank
            const globalMatch = html.match(/href="\/ratings\/all"[\s\S]*?<strong>\s*(\d+)\s*<\/strong>/i) ||
                                html.match(/<strong>\s*(\d+)\s*<\/strong>\s*[\r\n\s]*Global Rank/i) ||
                                html.match(/"globalRank":\s*(\d+)/);
            if (globalMatch) globalRank = parseInt(globalMatch[1]);

            // Extract country rank
            const countryMatch = html.match(/href="\/ratings\/all\?filterBy=Country[\s\S]*?<strong>\s*(\d+)\s*<\/strong>/i) ||
                                 html.match(/<strong>\s*(\d+)\s*<\/strong>\s*[\r\n\s]*Country Rank/i) ||
                                 html.match(/"countryRank":\s*(\d+)/);
            if (countryMatch) countryRank = parseInt(countryMatch[1]);

            if (rating > 0 || solved > 0 || globalRank > 0) {
              fetchedSuccessfully = true;
            }
          }
        } catch (err) {
          console.warn("CodeChef HTML fetch failed:", err);
        }
      }

      if (!fetchedSuccessfully && rating === 0 && solved === 0) {
        return NextResponse.json({
          solved: 0,
          solvedEasy: 0,
          solvedMedium: 0,
          solvedHard: 0,
          totalSubmissions: 0,
          acceptedSubmissions: 0,
          rank: "1★",
          rating: 0,
          highestRating: 0,
          globalRank: 0,
          countryRank: 0,
          submissionCalendar: {},
          isFallback: true
        }, { status: 200 });
      }

      return NextResponse.json({
        solved: solved || 0,
        solvedEasy: 0,
        solvedMedium: 0,
        solvedHard: 0,
        totalSubmissions: solved || 0,
        acceptedSubmissions: solved || 0,
        rank: rank || "1★",
        rating: rating || 0,
        highestRating: highestRating || rating || 0,
        globalRank: globalRank || 0,
        countryRank: countryRank || 0,
        submissionCalendar: {}
      });
    }

    if (platform === "hackerrank") {
      let solved = 0;
      let rating = 0;
      let rank = "Bronze";
      const globalRank = 0;
      const badges: Array<{ name: string; stars: number; points: number }> = [];
      let languages: string[] = [];
      let fetchedSuccessfully = false;

      const hrHeaders = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "application/json"
      };

      try {
        const [profRes, badgeRes, scoreRes] = await Promise.allSettled([
          fetch(`https://www.hackerrank.com/rest/contests/master/hackers/${cleanUsername}/profile`, { headers: hrHeaders, cache: "no-store" }),
          fetch(`https://www.hackerrank.com/rest/hackers/${cleanUsername}/badges`, { headers: hrHeaders, cache: "no-store" }),
          fetch(`https://www.hackerrank.com/rest/hackers/${cleanUsername}/scores_elo`, { headers: hrHeaders, cache: "no-store" })
        ]);

        if (profRes.status === "fulfilled" && profRes.value.ok) {
          try {
            const profData = await profRes.value.json();
            const model = profData?.model || {};
            if (model.id) {
              fetchedSuccessfully = true;
              rank = model.title || (model.level ? `Level ${model.level}` : "Gold");
              languages = Array.isArray(model.languages) ? model.languages : [];
            }
          } catch {}
        }

        if (badgeRes.status === "fulfilled" && badgeRes.value.ok) {
          try {
            const badgeData = await badgeRes.value.json();
            const models = Array.isArray(badgeData?.models) ? badgeData.models : [];
            models.forEach((b: any) => {
              const bSolved = parseInt(b.solved || 0);
              solved += bSolved;
              badges.push({
                name: b.badge_name || b.badge_type || "Skill",
                stars: parseInt(b.stars || 0),
                points: parseInt(b.current_points || 0)
              });
            });
            if (models.length > 0) fetchedSuccessfully = true;
          } catch {}
        }

        if (scoreRes.status === "fulfilled" && scoreRes.value.ok) {
          try {
            const scoreData = await scoreRes.value.json();
            if (Array.isArray(scoreData) && scoreData.length > 0) {
              const eloSum = scoreData.reduce((acc: number, s: any) => acc + (parseFloat(s.score) || 0), 0);
              rating = Math.round(eloSum / scoreData.length) || rating;
            }
          } catch {}
        }
      } catch (err) {
        console.warn("HackerRank API fetch notice:", err);
      }

      if (!fetchedSuccessfully) {
        return NextResponse.json({
          solved: 0,
          solvedEasy: 0,
          solvedMedium: 0,
          solvedHard: 0,
          totalSubmissions: 0,
          acceptedSubmissions: 0,
          rank: "Unranked",
          rating: 0,
          highestRating: 0,
          globalRank: 0,
          badges: [],
          languages: [],
          submissionCalendar: {},
          isFallback: true
        }, { status: 200 });
      }

      return NextResponse.json({
        solved: solved || 0,
        solvedEasy: 0,
        solvedMedium: 0,
        solvedHard: 0,
        totalSubmissions: solved || 0,
        acceptedSubmissions: solved || 0,
        rank: rank || "Gold",
        rating: rating || 1500,
        highestRating: rating || 1500,
        globalRank: globalRank || 0,
        badges,
        languages,
        submissionCalendar: {}
      }, {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"
        }
      });
    }

    if (platform === "geeksforgeeks" || platform === "gfg") {
      let solved = 0;
      let solvedEasy = 0;
      let solvedMedium = 0;
      let solvedHard = 0;
      let solvedBasic = 0;
      let solvedSchool = 0;
      let codingScore = 0;
      let rating = 0;
      let highestRating = 0;
      let rank = "Practitioner";
      let globalRank = 0;
      let instituteRank = 0;
      let streak = 0;
      const podCompleted = false;
      let fetchedSuccessfully = false;

      const gfgHeaders = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.geeksforgeeks.org/"
      };

      // Method 1: Try public GFG proxy API first
      try {
        const proxyRes = await fetch(`https://geeks-for-geeks-api.vercel.app/${cleanUsername}`, {
          cache: "no-store",
          headers: { Accept: "application/json" }
        });
        if (proxyRes.ok) {
          const pData = await proxyRes.json();
          if (pData && (pData.totalProblemsSolved !== undefined || pData.info || pData.totalSolved !== undefined)) {
            solved = parseInt(pData.totalProblemsSolved || pData.totalSolved || pData.info?.totalProblemsSolved || 0);
            codingScore = parseInt(pData.codingScore || pData.info?.codingScore || pData.score || 0);
            instituteRank = parseInt(pData.institutionRank || pData.instituteRank || pData.info?.institutionRank || 0);
            globalRank = parseInt(pData.globalRank || pData.info?.globalRank || instituteRank || 0);
            streak = parseInt(pData.currentStreak || pData.info?.currentStreak || pData.streak || 0);
            rating = parseInt(pData.contestRating || pData.info?.contestRating || pData.rating || 0);
            highestRating = rating;

            // Difficulty breakdown if available
            solvedSchool = parseInt(pData.schoolProblemsSolved || pData.school || 0);
            solvedBasic = parseInt(pData.basicProblemsSolved || pData.basic || 0);
            solvedEasy = parseInt(pData.easyProblemsSolved || pData.easy || 0) + solvedSchool + solvedBasic;
            solvedMedium = parseInt(pData.mediumProblemsSolved || pData.medium || 0);
            solvedHard = parseInt(pData.hardProblemsSolved || pData.hard || 0);

            if (solved > 0 || codingScore > 0 || instituteRank > 0) {
              fetchedSuccessfully = true;
            }
          }
        }
      } catch (err) {
        console.warn("GFG proxy API notice:", err);
      }

      // Method 2: Direct GFG profile HTML scraping & __NEXT_DATA__ extraction
      if (!fetchedSuccessfully || solved === 0) {
        try {
          const profileRes = await fetch(`https://www.geeksforgeeks.org/user/${cleanUsername}/?t=${Date.now()}`, {
            headers: gfgHeaders,
            cache: "no-store"
          });

          if (profileRes.ok) {
            const html = await profileRes.text();

            // 1. Try __NEXT_DATA__ JSON script tag
            const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
            if (nextDataMatch) {
              try {
                const nextData = JSON.parse(nextDataMatch[1]);
                const pageProps = nextData?.props?.pageProps;
                const userInfo = pageProps?.userInfo || pageProps?.user_data || pageProps?.data || {};

                if (userInfo.user_handle || userInfo.name || pageProps?.userHandle) {
                  fetchedSuccessfully = true;
                  solved = parseInt(userInfo.total_problems_solved || userInfo.totalProblemsSolved || pageProps?.totalProblemsSolved || 0);
                  codingScore = parseInt(userInfo.score || userInfo.coding_score || userInfo.codingScore || pageProps?.codingScore || 0);
                  instituteRank = parseInt(userInfo.institute_rank || userInfo.institutionRank || pageProps?.institutionRank || 0);
                  globalRank = parseInt(userInfo.global_rank || userInfo.rank || instituteRank || 0);
                  streak = parseInt(userInfo.pod_solved_long || userInfo.currentStreak || pageProps?.currentStreak || 0);
                  rating = parseInt(userInfo.contest_rating || userInfo.contestRating || pageProps?.contestRating || 0);
                  highestRating = rating;

                  // Parse difficulties
                  const diffObj = pageProps?.userDifficultyStats || userInfo.difficultyStats || {};
                  solvedSchool = parseInt(diffObj.school?.count || diffObj.School || 0);
                  solvedBasic = parseInt(diffObj.basic?.count || diffObj.Basic || 0);
                  solvedEasy = parseInt(diffObj.easy?.count || diffObj.Easy || 0) + solvedSchool + solvedBasic;
                  solvedMedium = parseInt(diffObj.medium?.count || diffObj.Medium || 0);
                  solvedHard = parseInt(diffObj.hard?.count || diffObj.Hard || 0);
                }
              } catch {}
            }

            // 2. DOM regex fallbacks if __NEXT_DATA__ didn't yield values
            if (!fetchedSuccessfully || solved === 0) {
              const solvedMatch = html.match(/Problems Solved[\s\S]*?(\d+)/i) || 
                                  html.match(/Total Problems Solved[\s\S]*?(\d+)/i) ||
                                  html.match(/problemSolved[^>]*>\s*(\d+)/i) ||
                                  html.match(/(\d+)\s*Problems Solved/i);
              if (solvedMatch) {
                solved = parseInt(solvedMatch[1]);
                fetchedSuccessfully = true;
              }

              const scoreMatch = html.match(/Coding Score[\s\S]*?(\d+)/i) ||
                                 html.match(/score_card_value[^>]*>\s*(\d+)/i) ||
                                 html.match(/Overall Coding Score[\s\S]*?(\d+)/i);
              if (scoreMatch) {
                codingScore = parseInt(scoreMatch[1]);
                fetchedSuccessfully = true;
              }

              const rankMatch = html.match(/Institute Rank[\s\S]*?(\d+)/i) ||
                                html.match(/Institution Rank[\s\S]*?(\d+)/i);
              if (rankMatch) {
                instituteRank = parseInt(rankMatch[1]);
                globalRank = instituteRank;
                fetchedSuccessfully = true;
              }

              const streakMatch = html.match(/POTD Streak[\s\S]*?(\d+)/i) ||
                                  html.match(/Current Streak[\s\S]*?(\d+)/i);
              if (streakMatch) {
                streak = parseInt(streakMatch[1]);
              }
            }
          }
        } catch (err) {
          console.warn("GFG HTML scraping notice:", err);
        }
      }

      if (instituteRank > 0) {
        if (instituteRank <= 10) rank = "Institute Top 10";
        else if (instituteRank <= 50) rank = "Institute Top 50";
        else if (instituteRank <= 100) rank = "Institute Top 100";
        else rank = `Rank #${instituteRank}`;
      } else if (codingScore > 1000) {
        rank = "Grandmaster";
      } else if (codingScore > 500) {
        rank = "Master";
      } else if (codingScore > 100) {
        rank = "Specialist";
      } else {
        rank = "Practitioner";
      }

      if (!fetchedSuccessfully && solved === 0 && codingScore === 0) {
        return NextResponse.json({
          solved: 0,
          solvedEasy: 0,
          solvedMedium: 0,
          solvedHard: 0,
          codingScore: 0,
          totalSubmissions: 0,
          acceptedSubmissions: 0,
          rank: "Practitioner",
          rating: 0,
          highestRating: 0,
          globalRank: 0,
          instituteRank: 0,
          streak: 0,
          podCompleted: false,
          submissionCalendar: {},
          isFallback: true
        }, { status: 200 });
      }

      return NextResponse.json({
        solved: solved || 0,
        solvedEasy: solvedEasy || 0,
        solvedMedium: solvedMedium || 0,
        solvedHard: solvedHard || 0,
        codingScore: codingScore || 0,
        totalSubmissions: solved || 0,
        acceptedSubmissions: solved || 0,
        rank: rank || "Practitioner",
        rating: rating || codingScore || 0,
        highestRating: highestRating || codingScore || 0,
        globalRank: globalRank || instituteRank || 0,
        instituteRank: instituteRank || 0,
        streak: streak || 0,
        podCompleted: podCompleted || false,
        submissionCalendar: {}
      }, {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"
        }
      });
    }

    return NextResponse.json({ error: "Unsupported platform" }, { status: 400 });
  } catch (err) {
    console.error(`Error loading stats for ${platform} (${cleanUsername}):`, err);
    return NextResponse.json({
      solved: 0,
      solvedEasy: 0,
      solvedMedium: 0,
      solvedHard: 0,
      totalSubmissions: 0,
      acceptedSubmissions: 0,
      rank: "Top 25%",
      rating: 1500,
      globalRank: 0,
      leetcodeStreak: 0,
      submissionCalendar: {},
      isFallback: true,
      error: "Temporary network timeout"
    }, { status: 200 });
  }
}
