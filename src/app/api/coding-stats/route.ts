import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";



export async function GET(request: Request) {
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

      if (!matchedUser) {
        return NextResponse.json({ error: "LeetCode user profile not found" }, { status: 404 });
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
      const dailyChallengeData = statsData?.data?.activeDailyCodingChallengeQuestion;
      
      let dailyChallengeCompleted = false;
      let dailyChallengeInfo = null;
      
      if (dailyChallengeData) {
        const dailyDate = dailyChallengeData.date; // e.g. "2026-07-21"
        const dailySlug = dailyChallengeData.question?.titleSlug;
        const dailyTitle = dailyChallengeData.question?.title;
        
        // Check if exact daily challenge problem was solved
        const hasSolvedExactDaily = recentSubmissions.some((sub: any) => {
          const matchSlug = sub.titleSlug && dailySlug && sub.titleSlug.toLowerCase() === dailySlug.toLowerCase();
          const matchTitle = sub.title && dailyTitle && sub.title.toLowerCase() === dailyTitle.toLowerCase();
          if (!matchSlug && !matchTitle) return false;
          
          const subDate = new Date(parseInt(sub.timestamp) * 1000);
          const timeDiffHours = Math.abs(Date.now() - subDate.getTime()) / (1000 * 60 * 60);
          
          const subDateKeyUTC = `${subDate.getUTCFullYear()}-${String(subDate.getUTCMonth() + 1).padStart(2, "0")}-${String(subDate.getUTCDate()).padStart(2, "0")}`;
          const subDateKeyLocal = `${subDate.getFullYear()}-${String(subDate.getMonth() + 1).padStart(2, "0")}-${String(subDate.getDate()).padStart(2, "0")}`;
          
          return timeDiffHours <= 48 || subDateKeyUTC === dailyDate || subDateKeyLocal === dailyDate;
        });

        // Also check if ANY problem was solved on LeetCode today
        const hasSolvedAnyToday = recentSubmissions.some((sub: any) => {
          const subDate = new Date(parseInt(sub.timestamp) * 1000);
          const timeDiffHours = Math.abs(Date.now() - subDate.getTime()) / (1000 * 60 * 60);
          const subDateKeyUTC = `${subDate.getUTCFullYear()}-${String(subDate.getUTCMonth() + 1).padStart(2, "0")}-${String(subDate.getUTCDate()).padStart(2, "0")}`;
          const subDateKeyLocal = `${subDate.getFullYear()}-${String(subDate.getMonth() + 1).padStart(2, "0")}-${String(subDate.getDate()).padStart(2, "0")}`;
          const todayUTC = new Date().toISOString().split("T")[0];
          const todayLocal = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`;

          return timeDiffHours <= 30 || subDateKeyUTC === todayUTC || subDateKeyLocal === todayLocal;
        });

        dailyChallengeCompleted = hasSolvedExactDaily || hasSolvedAnyToday;
        dailyChallengeInfo = {
          title: dailyChallengeData.question?.title,
          link: `https://leetcode.com${dailyChallengeData.link}`,
          difficulty: dailyChallengeData.question?.difficulty,
          date: dailyChallengeData.date,
          completed: dailyChallengeCompleted
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

              // Dynamic consecutive streak calculation
              let dynamicStreak = 0;
              let checkDate = new Date();
              const todayKey = `${checkDate.getUTCFullYear()}-${String(checkDate.getUTCMonth() + 1).padStart(2, "0")}-${String(checkDate.getUTCDate()).padStart(2, "0")}`;
              if (!submissionCalendar[todayKey]) {
                checkDate.setDate(checkDate.getDate() - 1);
              }
              while (true) {
                const key = `${checkDate.getUTCFullYear()}-${String(checkDate.getUTCMonth() + 1).padStart(2, "0")}-${String(checkDate.getUTCDate()).padStart(2, "0")}`;
                if (submissionCalendar[key] && submissionCalendar[key] > 0) {
                  dynamicStreak++;
                  checkDate.setDate(checkDate.getDate() - 1);
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
        dailyChallenge: dailyChallengeInfo
      });
    }

    if (platform === "codeforces") {
      // try catch error handling safeguard
      const infoRes = await fetch(`https://codeforces.com/api/user.info?handles=${cleanUsername}&t=${Date.now()}`, {
        cache: "no-store"
      });
      if (!infoRes.ok) {
        return NextResponse.json({ error: "Codeforces profile not found" }, { status: 404 });
      }

      const infoData = await infoRes.json();
      if (infoData.status !== "OK" || !infoData.result?.[0]) {
        return NextResponse.json({ error: "Codeforces profile not found" }, { status: 404 });
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
      // try catch error handling safeguard
      const response = await fetch(`https://www.codechef.com/users/${cleanUsername}?t=${Date.now()}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        cache: "no-store"
      });
      if (!response.ok) {
        return NextResponse.json({ error: "CodeChef profile not found" }, { status: 404 });
      }

      const html = await response.text();

      const ratingMatch = html.match(/class="rating-number"[^>]*>(\d+)/) || html.match(/rating-number[^>]*>(\d+)/);
      if (!ratingMatch) {
        return NextResponse.json({ error: "CodeChef profile invalid or empty" }, { status: 404 });
      }
      const rating = parseInt(ratingMatch[1]);

      const starsMatch = html.match(/rating[^>]*>.*?(\d+)★/) || html.match(/(\d)★/);
      const rank = starsMatch ? `${starsMatch[1]}★` : "1★";

      const solvedMatch = html.match(/Fully Solved[\s\S]*?\((\d+)\)/) || html.match(/Fully Solved[\s\S]*?(\d+)/);
      const solved = solvedMatch ? parseInt(solvedMatch[1]) : 0;

      return NextResponse.json({
        solved,
        solvedEasy: 0,
        solvedMedium: 0,
        solvedHard: 0,
        totalSubmissions: solved,
        acceptedSubmissions: solved,
        rank,
        rating,
        globalRank: rating,
        submissionCalendar: {}
      });
    }

    return NextResponse.json({ error: "Unsupported platform" }, { status: 400 });
  } catch (err) {
    console.error(`Error loading stats for ${platform} (${cleanUsername}):`, err);
    return NextResponse.json({ error: "Could not fetch stats" }, { status: 500 });
  }
}
