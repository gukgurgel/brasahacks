'use client'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { useEffect, useState } from 'react'
import { useUIState, useAIState } from 'ai/rsc'
import { Message, Session } from '@/lib/types'
import { usePathname, useRouter } from 'next/navigation'
import { useScrollAnchor } from '@/lib/hooks/use-scroll-anchor'
import { toast } from 'sonner'
import { HeaderMenu } from './header-menu'
import { models } from 'powerbi-client';
import { isMobile } from 'react-device-detect';
import { PowerBIEmbed } from 'powerbi-client-react';
import Education from './education'
import { Embed } from 'embed'

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
  session?: Session
  missingKeys: string[]
}

export function Chat({ id, className, session, missingKeys }: ChatProps) {
  const router = useRouter()
  const path = usePathname()
  const [input, setInput] = useState('')
  const [messages] = useUIState()
  const [aiState] = useAIState()
  const [report, setReport] = useState<Report>();

  const [_, setNewChatId] = useLocalStorage('newChatId', id)

  useEffect(() => {
    if (session?.user) {
      if (!path.includes('chat') && messages.length === 1) {
        window.history.replaceState({}, '', `/chat/${id}`)
      }
    }
  }, [id, path, session?.user, messages])

  useEffect(() => {
    const messagesLength = aiState.messages?.length
    if (messagesLength === 2) {
      router.refresh()
    }
  }, [aiState.messages, router])

  useEffect(() => {
    setNewChatId(id)
  })

  useEffect(() => {
    missingKeys.map(key => {
      toast.error(`Missing ${key} environment variable!`)
    })
  }, [missingKeys])

  const { messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom } =
    useScrollAnchor()

  const [currentPage, setCurrentPage] = useState('chat');

  return (
    <div
      className="group w-full overflow-auto pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]"
      ref={scrollRef}
    >
      <div
        className='menu flex'
      >
        <HeaderMenu currentPage={currentPage} setCurrentPage={setCurrentPage} />
      </div>
      {currentPage === 'chat' ? 
        <div>
          <div
            className={cn('pb-[200px] pt-10', className)}
            ref={messagesRef}
          >
            {messages.length ? (
              <ChatList messages={messages} isShared={false} session={session} />
            ) : (
              <EmptyScreen />
            )}
            <div className="w-full h-px" ref={visibilityRef} />
          </div>
          <ChatPanel
            id={id}
            input={input}
            setInput={setInput}
            isAtBottom={isAtBottom}
            scrollToBottom={scrollToBottom}
          />
        </div> 
        : currentPage === 'dashboard' ?
          <div className='dashboard-container'>
            {/* <PowerBIEmbed
              embedConfig = {{
                type: 'report',
                id: 'dcae53e1-a703-4ff6-b6d6-3cfc5c794f0b',
                embedUrl: 'https://app.powerbi.com/reportEmbed?reportId=dcae53e1-a703-4ff6-b6d6-3cfc5c794f0b&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLVVTLUVBU1QyLUQtUFJJTUFSWS1yZWRpcmVjdC5hbmFseXNpcy53aW5kb3dzLm5ldCIsImVtYmVkRmVhdHVyZXMiOnsidXNhZ2VNZXRyaWNzVk5leHQiOnRydWV9fQ%3d%3d',
                accessToken: 'H4sIAAAAAAAEAB3Ut46lCgIE0H_plJWAi7mw0gR47z0Z3nvP0_v37dm8oqOq-ufHTJ5-SvKf__6gKDLdXnGjuxCRoW5cB2bXghcczZf4NG6FLkv_uAIQT1oxX1JFBM6oOSKTw3WgNtGe9FJ9gyxfZDZcGfy3O8CTCjRR5Zubdmuuqh5lcEzARqiBug6OYqm-Fh4EXGoFM2TAHn1ta-eSZ8o9eouBNjwBOgpcJRX9I1lrkRcqYbG6e_kPxJAuZ-Y5RMcLhaxi5c_KS9rvSUImBin92gNpAeT1J8sHo22wCTweUA3lUUQepvSbFbOw7fz0k65zgmbywwGzgrM3mnuAUlmHEvHoAMtkW2vLJwGNh0VaOjVsIu91J27OL8_gvqOjh0AuRT8C_mAn-AUPzhfpufmvA58Z1pwLtwED4KBIY0nWB1f0mEL0hCVLlYmN8tK852Eu55GiV3emghOCHyXGtzZLxA6k00COVJ2cARzzpQ4GZ-sqP29k7LviloMCBM0DN7v8OPlDqq7SLXwolYkkSMxilI692dFInyqLQNQLZUmnLU-UTcqLH8pJUGEOKXhMbZ1PMN1yS8n1lE_HP3q_fZZFB3ZklitycRWJSoB6y7t6qrgEPGI2MiTNIEytuuYhl2lotjbg5gZ7rphTFmkCAnABgAvTFCpTHrZ6CsIJkQXYqd14Rxf81TnzV2ZtUY8fyJzPMDYiKmeTHM-YtbGQUHK6MxKwF7vgYNzdEdlbeweQGF5IHxhJp60HwW9YDXt_3IerzIfOWawi5BUUFIG9xQCgRe-ln2_R-CQJT4h3jCIPt_gX5NcddLz7mVOfiWYBhDNOW6Qc16u-PzAL17yWjKiOjUTB8R6B3i7B9NrljY9G4tAXCUpubEzF5XhW7z_zMM-4GeQ0rVDBz39-mPWZ90kpnt85JTqGJtWZ3EIQIqAFS6eldl67Zh6nij0O5QGDeorhVQLKS-2b6cbk1dvunY3_ZLs9OAhDXNptpr00-orHJJ42LSQTQhQnV7CAsqnW8rvmRLgZufH1BMGVzbP4GTwRCAQoyK0F_WgzDdrWjYk60RXr3MFU5_f-cKm4vGYc3FlDsokwre0agL1Yz2087CIoLBMSsSWtbqGuxX0lfndJMn5OSP8cyAuKiZh2nujOX3eVQeO3dZ-MGkIZse89TjKRTUWtT1YUgE1JdY72hUPmtYFaEZI4LBsF_GqlUzNIBnnvw1JpSffYaMUIjBaq4ylJgmhOB7obK9-TOF3Os7gxHhya0HXVnz9_mZ-5LlbJ_1Uuk118uxCO2t4YJb5mo-70qf-nnKYak_1Yi9_Y-dX9zzu3RFo5NRtHC3aaPGZOAoyH-2f8_BaYMW3phMdvoH8zAesbP48lkj-UkOgv_PWjGZ_cIrjL0x_ZNW_rNLoxiajg7W442tc7t8nVGRJ5aKPGAP69jQtO0AYHUDTlNrdQ6n2otrCO0YRQxKhCZ-KdjueW_I1VdxqqueRzgvnGW7uQtCegSVdjrAzKwBUQxF6B09qNBWTm2pzbUm5K78obOmSxEGWomG4CgNKWO6qlu-wX01N_P90v3l8GJ_Wc4xNwzLt1uYxL9cV1MFdLh56ypuTLQzR_J8Ytq_ENkNwNhMhxk74-7LEQOFv7HFaPd8cseYGa8pflDv64Zq0oNvz7l_nf_wFKFF7oQgYAAA==.eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLVVTLUVBU1QyLUQtUFJJTUFSWS1yZWRpcmVjdC5hbmFseXNpcy53aW5kb3dzLm5ldCIsImV4cCI6MTcyNDYzMjc5MiwiYWxsb3dBY2Nlc3NPdmVyUHVibGljSW50ZXJuZXQiOnRydWV9',
                tokenType: models.TokenType.Embed,
                settings: {
                  layoutType: isMobile ? models.LayoutType.MobilePortrait : models.LayoutType.Master,
                  panes: {
                    filters: {
                      expanded: false,
                      visible: false
                    }
                  },
                  background: models.BackgroundType.Transparent,
                  navContentPaneEnabled: false
                }
              }}
              eventHandlers = {new Map([
                ['loaded', () => console.log('Report loaded')],
                ['rendered', () => console.log('Report rendered')],
                ['error', (event: any) => console.log(event.detail)],
                ['visualClicked', () => console.log('Visual clicked')],
                ['pageChanged', (event: any) => console.log(event)]
              ])}
              cssClassName = { "bi-dashboard" }
            /> */}
            <iframe className="bi-dashboard"  title="Stone_dashboard" src="https://app.powerbi.com/view?r=eyJrIjoiOTQzMTk2NjAtMmJlYy00MzNlLWJjMDEtNTc5YzgwZmRhMzUxIiwidCI6ImUzNmVlMzhmLTkxYjgtNGRjYS05YjEzLWNhYTUzNjBjOTcxNCIsImMiOjF9"></iframe>
          </div>
        : <Education />
      }
    </div>
  )
}
